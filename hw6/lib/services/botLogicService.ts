import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation } from '@/lib/models';
import { sendTextMessage } from './lineService';
import { getOrCreateUser, getUserByLineId } from './userService';
import { markAllUserConversationsInactive } from './conversationService';
import { logger } from '@/lib/utils/logger';
import {
  getWelcomeMessage,
  HELP_MESSAGE,
  INFO_MESSAGE,
  ERROR_MESSAGES,
} from '@/lib/constants/bot';
import { getCommandType } from '@/lib/constants/commands';

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

    // Send welcome message
    const welcomeMessage = getWelcomeMessage(user.displayName || '朋友');
    await sendTextMessage(replyToken, welcomeMessage);

    logger.info('Welcome message sent', { userId });
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
 */
export const handleCommand = withDatabase(async (
  command: string,
  userId: string,
  replyToken: string
): Promise<string | null> => {
  const commandType = getCommandType(command);

  // Help command
  if (commandType === 'help') {
    return HELP_MESSAGE;
  }

  // Stats command (for user's own stats)
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

  // Info command
  if (commandType === 'info') {
    return INFO_MESSAGE;
  }

  // Unknown command
  return null;
});

