import { withDatabase } from '@/lib/utils/withDatabase';
import { sendTextMessage, type WebhookEvent } from './lineService';
import { llmService } from './llmService';
import { ragService } from './ragService';
import { isCommand, handleCommand } from './botLogicService';
import { conversationFlowService } from './conversationFlowService';
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

      // Try conversation flow service first (for navigation commands)
      const handledByFlow = await conversationFlowService.handleTextMessage(
        messageText,
        replyToken,
        conversation._id.toString()
      );

      if (handledByFlow) {
        // Message was handled by conversation flow (navigation)
        logger.info('Message handled by conversation flow', { userId, message: messageText });
        return;
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
 * Generate reply message using RAG with fallback to direct LLM
 * RAG workflow:
 * 1. Try RAG (knowledge base + LLM)
 * 2. If RAG fails, fallback to direct LLM
 * 3. If direct LLM fails, use fallback responses
 */
async function generateReply(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Commands are already handled before this function is called

  // Step 1: Try RAG first (knowledge base + LLM)
  try {
    logger.debug('Attempting RAG response', { userMessage: userMessage.substring(0, 50) });
    const ragResponse = await ragService.generateRAGResponse(userMessage, conversationHistory);
    return ragResponse;
  } catch (ragError) {
    logger.warn('RAG failed, falling back to direct LLM', {
      error: ragError instanceof Error ? ragError.message : String(ragError),
      userMessage: userMessage.substring(0, 50),
    });

    // Step 2: Fallback to direct LLM if RAG fails
    try {
      logger.debug('Attempting direct LLM response', { userMessage: userMessage.substring(0, 50) });
      const response = await llmService.generateResponse(userMessage, conversationHistory);
      return response.content;
    } catch (llmError) {
      logger.error('Direct LLM also failed', {
        ragError: ragError instanceof Error ? ragError.message : String(ragError),
        llmError: llmError instanceof Error ? llmError.message : String(llmError),
        userMessage: userMessage.substring(0, 50),
      });

      // Step 3: Handle different error types and use fallback responses
      if (llmError instanceof LLMError) {
        // For retryable errors, use fallback
        // Error details are already logged above, don't expose to users
        if (llmError.retryable) {
          return getFallbackResponse(userMessage);
        }

        // For non-retryable errors (quota, auth), return user-facing message only
        // Developer error details are already logged above
        if (llmError.code === 'QUOTA_EXCEEDED' || llmError.code === 'AUTH_ERROR') {
          return ERROR_MESSAGES.LLM_ERROR;
        }

        // For other errors, use fallback
        // Error details are already logged above, don't expose to users
        return getFallbackResponse(userMessage);
      }

      // Unknown error, use fallback
      // Error details are already logged above, don't expose to users
      return getFallbackResponse(userMessage);
    }
  }
}

/**
 * Get fallback response when LLM fails
 * Note: Error details are logged but not exposed to users
 */
function getFallbackResponse(userMessage: string): string {
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
  return FALLBACK_RESPONSES.DEFAULT(userMessage);
}

/**
 * Process postback event (button click)
 */
export async function processPostback(event: WebhookEvent): Promise<void> {
  if (event.type !== 'postback') {
    return;
  }

  const userId = event.source.userId;
  if (!userId) {
    logger.error('No user ID in postback event');
    return;
  }

  const postbackData = event.postback.data;
  const replyToken = event.replyToken;

  // Use withDatabase wrapper for the entire processing
  await withDatabase(async () => {
    try {
      // Get or create user
      const user = await getOrCreateUser(userId);

      // Get or create active conversation
      const conversation = await getOrCreateActiveConversation(user._id, userId);

      // Save postback as user message
      await saveMessage(conversation._id, `[按鈕點擊] ${postbackData}`, 'user', 'text');

      // Update conversation message count
      await incrementConversationMessageCount(conversation._id);

      // Handle postback using conversation flow service
      await conversationFlowService.handlePostback(
        postbackData,
        replyToken,
        conversation._id.toString()
      );

      logger.info('Postback processed', { userId, postbackData });
    } catch (error) {
      logger.error('Error processing postback', error, { userId, postbackData });
      // Send error message to user
      try {
        await sendTextMessage(replyToken, ERROR_MESSAGES.PROCESSING_ERROR);
      } catch (sendError) {
        logger.error('Error sending error message', sendError, { userId });
      }
    }
  })();
}

