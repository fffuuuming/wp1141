import { withDatabase } from '@/lib/utils/withDatabase';
import { sendTextMessage, pushTextMessage, type WebhookEvent } from './lineService';
import { llmService } from './llmService';
import { ragService } from './ragService';
import { isCommand, handleCommand } from './botLogicService';
import { getCommandType } from '@/lib/constants/commands';
import { conversationFlowService } from './conversationFlowService';
import { conversationGraphService } from './conversationGraphService';
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
import { HELP_MESSAGE, INFO_MESSAGE } from '@/lib/constants/bot';

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

  // Check if message is a simple command first (before DB operations)
  // Simple commands don't need to save messages or update counts
  const commandType = isCommand(messageText) ? getCommandType(messageText) : null;
  const isSimpleCommand = commandType === 'help' || commandType === 'info';

  // Use withDatabase wrapper for the entire processing
  await withDatabase(async () => {
    try {
      // For simple commands, skip unnecessary DB operations
      if (isSimpleCommand) {
        const commandReply = await handleCommandSimple(messageText, userId, replyToken);
        if (commandReply) {
          await sendTextMessage(replyToken, commandReply);
          logger.info('Simple command processed', { userId, command: messageText });
        }
        return;
      }

      // Get or create user (automatically updates last active time)
      const user = await getOrCreateUser(userId);

      // Get or create active conversation
      const conversation = await getOrCreateActiveConversation(user._id, userId);

      // Check if message is a command (non-simple commands like menu, stats)
      if (isCommand(messageText)) {
        const commandReply = await handleCommand(messageText, userId, replyToken);
        if (commandReply) {
          // Save command response
          await saveMessage(conversation._id, commandReply, 'bot', 'text');

          // Send command response
          await sendTextMessage(replyToken, commandReply);
          logger.info('Command processed', { userId, command: messageText });
          return;
        } else {
          // Command was handled but returned null (e.g., menu command sends buttons directly)
          // Check if it's a menu command to return early
          if (getCommandType(messageText) === 'menu') {
            logger.info('Menu command processed', { userId });
            return;
          }
        }
      }

      // Save incoming message (only for non-command messages)
      await saveMessage(conversation._id, messageText, 'user', 'text');

      // Update conversation message count and last message time
      await incrementConversationMessageCount(conversation._id);

      // Update user message count
      await incrementUserMessageCount(userId);

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

      // Get conversation history for context (limited to 5 for faster processing)
      const conversationHistory = await getConversationHistory(conversation._id, 5);

      // Generate reply using LLM with fallback (optimized for speed)
      const replyText = await generateReply(messageText, conversationHistory);

      // Save bot reply (non-blocking - don't wait for it to complete)
      saveMessage(conversation._id, replyText, 'bot', 'text').catch((error) => {
        logger.error('Error saving bot reply', error, { userId });
      });

      // Send reply to user immediately
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
 * 1. For short/simple questions, skip RAG and use direct LLM (faster)
 * 2. For longer questions, try RAG first (knowledge base + LLM)
 * 3. If RAG fails, fallback to direct LLM
 * 4. If direct LLM fails, use fallback responses
 */
async function generateReply(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Commands are already handled before this function is called

  // Skip RAG for very short messages (< 10 chars) - use direct LLM for speed
  const isShortMessage = userMessage.trim().length < 10;
  
  if (isShortMessage) {
    logger.debug('Short message detected, skipping RAG for speed', { 
      userMessage: userMessage.substring(0, 50) 
    });
    try {
      const response = await llmService.generateResponse(userMessage, conversationHistory);
      return response.content;
    } catch (llmError) {
      logger.error('Direct LLM failed for short message', {
        llmError: llmError instanceof Error ? llmError.message : String(llmError),
        userMessage: userMessage.substring(0, 50),
      });
      return getFallbackResponse(userMessage);
    }
  }

  // Step 1: Try RAG first (knowledge base + LLM) for longer questions
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
 * Handle simple commands (help, info) without database operations
 * These commands don't need to save messages or update counts
 */
async function handleCommandSimple(
  command: string,
  userId: string,
  replyToken: string
): Promise<string | null> {
  const commandType = getCommandType(command);

  // Help command
  if (commandType === 'help') {
    return HELP_MESSAGE;
  }

  // Info command
  if (commandType === 'info') {
    return INFO_MESSAGE;
  }

  return null;
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
      // Get or create user and conversation (minimal operations before sending response)
      const user = await getOrCreateUser(userId);
      const conversation = await getOrCreateActiveConversation(user._id, userId);

      // Handle postback immediately (send response to user first)
      // This is the most important operation - user sees response quickly
      await conversationFlowService.handlePostback(
        postbackData,
        replyToken,
        conversation._id.toString()
      );

      // After sending response, save message and update counts (non-blocking)
      const postback = event.postback as { data: string; displayText?: string };
      
      // Get display text - should always be set now since we set it on all buttons
      // If missing (edge case), look up node title asynchronously
      let userMessageText = postback.displayText;
      if (!userMessageText) {
        // Rare case: displayText missing, look up node (non-blocking)
        conversationGraphService.navigateToNode(postbackData)
          .then((node) => {
            return node?.title || postbackData;
          })
          .catch(() => postbackData)
          .then((text) => {
            return Promise.all([
              saveMessage(conversation._id, text, 'user', 'text'),
              incrementConversationMessageCount(conversation._id),
            ]);
          })
          .catch((error) => {
            logger.error('Error saving postback message', error, { userId, postbackData });
          });
        
        logger.info('Postback processed (displayText was missing)', { userId, postbackData });
        return;
      }

      // Save postback as user message (non-blocking, happens after response sent)
      Promise.all([
        saveMessage(conversation._id, userMessageText, 'user', 'text'),
        incrementConversationMessageCount(conversation._id),
      ]).catch((error) => {
        logger.error('Error saving postback message', error, { userId, postbackData });
      });

      logger.info('Postback processed', { userId, postbackData });
    } catch (error) {
      logger.error('Error processing postback', error, { userId, postbackData });
      // Don't try to send error message with reply token as it may have already been used
      // The error is logged for debugging purposes
    }
  })();
}

