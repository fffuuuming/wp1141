import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation } from '@/lib/models';
import { sendTextMessage, getUserProfile, replyMessage } from './lineService';
import { conversationFlowService } from './conversationFlowService';
import { conversationGraphService } from './conversationGraphService';
import { getOrCreateUser, getUserByLineId } from './userService';
import { markAllUserConversationsInactive, getOrCreateActiveConversation } from './conversationService';
import { logger } from '@/lib/utils/logger';
import {
  getWelcomeMessage,
  HELP_MESSAGE,
  INFO_MESSAGE,
  ERROR_MESSAGES,
} from '@/lib/constants/bot';
import { getCommandType } from '@/lib/constants/commands';
import type { Message } from '@line/bot-sdk';

/**
 * Handle user follow event (when user adds bot as friend)
 */
export const handleFollowEvent = withDatabase(async (
  userId: string,
  replyToken: string
): Promise<void> => {
  try {
    // Get or create user (don't update last active for follow event)
    const user = await getOrCreateUser(userId, { updateLastActive: false });

    // Get or create active conversation
    const conversation = await getOrCreateActiveConversation(user._id, userId);

    // Get user profile to personalize welcome message
    const profile = await getUserProfile(userId);
    const userName = profile?.displayName || '朋友';

    // Get welcome message
    const welcomeText = getWelcomeMessage(userName);

    // Get root node to build category buttons/carousel
    const rootNode = conversationGraphService.getRootNode();

    // Build messages array - send welcome message + category buttons in one reply
    const messages: Message[] = [
      {
        type: 'text',
        text: welcomeText,
      },
    ];

    // Add category buttons (always use buttons template, max 4 buttons)
    if (rootNode.children && rootNode.children.length > 0) {
      // LINE buttons template supports max 4 buttons
      const buttons = rootNode.children.slice(0, 4).map((child) => ({
        label: child.title,
        data: child.id,
      }));

      const buttonsMessage: Message = {
        type: 'template',
        altText: '請選擇您想了解的類別',
        template: {
          type: 'buttons',
          text: '請選擇您想了解的類別：',
          actions: buttons.map((button) => {
            const label = button.label.length > 20 ? button.label.substring(0, 17) + '...' : button.label;
            const data = button.data.length > 300 ? button.data.substring(0, 297) + '...' : button.data;
            return {
              type: 'postback',
              label: label,
              data: data,
              displayText: button.label,
            };
          }),
        },
      };

      messages.push(buttonsMessage);
    }

    // Send all messages in one reply (reply token used only once)
    await replyMessage(replyToken, messages);

    // Update conversation current node
    await Conversation.findByIdAndUpdate(conversation._id, {
      currentNodeId: rootNode.id,
    });

    logger.info('Welcome message with buttons sent', { userId, userName });
  } catch (error) {
    logger.error('Error handling follow event', error, { userId });
    // Try to send error message
    try {
      await sendTextMessage(replyToken, ERROR_MESSAGES.WELCOME_FALLBACK);
    } catch (sendError) {
      logger.error('Error sending welcome message', sendError, { userId });
    }
  }
});

/**
 * Handle user unfollow event (when user blocks bot)
 */
export const handleUnfollowEvent = withDatabase(async (userId: string): Promise<void> => {
  try {
    // Mark all active conversations as inactive
    const count = await markAllUserConversationsInactive(userId);

    logger.info('Marked conversations as inactive', { userId, count });
  } catch (error) {
    logger.error('Error handling unfollow event', error, { userId });
  }
});

/**
 * Check if message is a command
 */
export function isCommand(message: string): boolean {
  return getCommandType(message) !== null;
}

/**
 * Handle special commands
 * Note: This function is called from within withDatabase, so we don't wrap it again
 * Simple commands (help, info) should be handled by handleCommandSimple in messageService
 */
export async function handleCommand(
  command: string,
  userId: string,
  replyToken: string
): Promise<string | null> {
  const commandType = getCommandType(command);

  // Stats command (for user's own stats) - needs database
  if (commandType === 'stats') {
    try {
      const user = await getUserByLineId(userId);
      if (user) {
        const conversationCount = await Conversation.countDocuments({
          userId: user._id,
        });
        return `📊 你的統計資訊：

💬 總訊息數：${user.messageCount}
📝 對話數：${conversationCount}
🕐 最後活躍：${new Date(user.lastActiveAt).toLocaleString('zh-TW')}`;
      }
    } catch (error) {
      logger.error('Error getting user stats', error, { userId });
    }
    return ERROR_MESSAGES.STATS_ERROR;
  }

  // Menu command - show root menu with category buttons
  if (commandType === 'menu') {
    try {
      // Get or create user and conversation
      const user = await getOrCreateUser(userId);
      const conversation = await getOrCreateActiveConversation(user._id, userId);

      // Get root node
      const rootNode = conversationGraphService.getRootNode();

      // Build buttons message
      if (rootNode.children && rootNode.children.length > 0) {
        const buttons = rootNode.children.slice(0, 4).map((child) => ({
          label: child.title,
          data: child.id,
        }));

        const buttonsMessage: Message = {
          type: 'template',
          altText: '請選擇您想了解的類別',
          template: {
            type: 'buttons',
            text: '請選擇您想了解的類別：',
            actions: buttons.map((button) => {
              const label = button.label.length > 20 ? button.label.substring(0, 17) + '...' : button.label;
              const data = button.data.length > 300 ? button.data.substring(0, 297) + '...' : button.data;
              return {
                type: 'postback',
                label: label,
                data: data,
                displayText: button.label,
              };
            }),
          },
        };

        // Send buttons template
        await replyMessage(replyToken, [buttonsMessage]);

        // Update conversation current node
        await Conversation.findByIdAndUpdate(conversation._id, {
          currentNodeId: rootNode.id,
        });

        logger.info('Menu command processed', { userId });
        // Return null to indicate message already sent
        return null;
      } else {
        return '目前沒有可用的類別。';
      }
    } catch (error) {
      logger.error('Error handling menu command', error, { userId });
      return '無法顯示主選單，請稍後再試。';
    }
  }

  // Unknown command
  return null;
});

