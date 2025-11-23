import { withDatabase } from '@/lib/utils/withDatabase';
import { sendTextMessage, type WebhookEvent } from './lineService';
import { llmService } from './llmService';
import { isCommand, handleCommand } from './botLogicService';
import {
  getOrCreateUser,
  incrementUserMessageCount,
} from './userService';
import {
  getOrCreateActiveConversation,
  saveMessage,
  incrementConversationMessageCount,
  getConversationHistory,
} from './conversationService';
import { LLMError } from '@/lib/errors';
import { logger } from '@/lib/utils/logger';
import { FALLBACK_RESPONSES, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Process incoming message from Line
 */
export async function processMessage(event: WebhookEvent): Promise<void> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const userId = event.source.userId;
  if (!userId) {
    console.error('No user ID in event');
    return;
  }

  const messageText = event.message.text;
  const replyToken = event.replyToken;

  // Use withDatabase wrapper for the entire processing
  await withDatabase(async () => {
    try {
      // Get or create user (automatically updates last active time)
      const user = await getOrCreateUser(userId);

      // Get or create active conversation
      const conversation = await getOrCreateActiveConversation(user._id, userId);

      // Save incoming message
      await saveMessage(conversation._id, messageText, 'user', 'text');

      // Update conversation message count and last message time
      await incrementConversationMessageCount(conversation._id);

      // Update user message count
      await incrementUserMessageCount(userId);

      // Check if message is a command
      if (isCommand(messageText)) {
        const commandReply = await handleCommand(messageText, userId, replyToken);
        if (commandReply) {
          // Save command response
          await saveMessage(conversation._id, commandReply, 'bot', 'text');

          // Send command response
          await sendTextMessage(replyToken, commandReply);
          logger.info('Command processed', { userId, command: messageText });
          return;
        }
      }

      // Get conversation history for context
      const conversationHistory = await getConversationHistory(conversation._id);

      // Generate reply using LLM with fallback
      const replyText = await generateReply(messageText, conversationHistory);

      // Save bot reply
      await saveMessage(conversation._id, replyText, 'bot', 'text');

      // Send reply to user
      await sendTextMessage(replyToken, replyText);

      logger.info('Message processed', { userId, messageLength: messageText.length });
    } catch (error) {
      logger.error('Error processing message', error, { userId });
      // Send error message to user
      try {
        await sendTextMessage(replyToken, ERROR_MESSAGES.PROCESSING_ERROR);
      } catch (sendError) {
        logger.error('Error sending error message', sendError, { userId });
      }
    }
  })();
}

/**
 * Generate reply message using LLM with fallback
 */
async function generateReply(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Commands are already handled before this function is called

  // Try to generate response using LLM
  try {
    const response = await llmService.generateResponse(userMessage, conversationHistory);
    return response.content;
  } catch (error) {
    logger.error('LLM error', error, { userMessage: userMessage.substring(0, 50) });

    // Handle different error types
    if (error instanceof LLMError) {
      // For retryable errors, use fallback
      if (error.retryable) {
        return getFallbackResponse(userMessage, error.message);
      }

      // For non-retryable errors (quota, auth), return error message
      if (error.code === 'QUOTA_EXCEEDED' || error.code === 'AUTH_ERROR') {
        return `${ERROR_MESSAGES.LLM_ERROR} ${error.message}`;
      }

      // For other errors, use fallback
      return getFallbackResponse(userMessage, error.message);
    }

    // Unknown error, use fallback
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return getFallbackResponse(userMessage, errorMessage);
  }
}

/**
 * Get fallback response when LLM fails
 */
function getFallbackResponse(
  userMessage: string,
  errorMessage?: string
): string {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Greeting responses
  if (
    lowerMessage.includes('hi') ||
    lowerMessage.includes('hello') ||
    lowerMessage.includes('你好') ||
    lowerMessage.includes('嗨')
  ) {
    return FALLBACK_RESPONSES.GREETING;
  }

  // Question responses
  if (lowerMessage.includes('?') || lowerMessage.includes('？')) {
    return FALLBACK_RESPONSES.QUESTION(userMessage);
  }

  // Default fallback
  return FALLBACK_RESPONSES.DEFAULT(userMessage, errorMessage);
}

