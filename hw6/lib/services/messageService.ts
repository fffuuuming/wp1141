import { withDatabase } from '@/lib/utils/withDatabase';
import { sendTextMessage, type WebhookEvent } from './lineService';
import { llmService, type LLMError } from './llmService';
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
          console.log(`Command processed: ${messageText} from ${userId}`);
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

      console.log(`Processed message from ${userId}: ${messageText}`);
    } catch (error) {
      console.error('Error processing message:', error);
      // Send error message to user
      try {
        await sendTextMessage(
          replyToken,
          '抱歉，處理您的訊息時發生錯誤，請稍後再試。'
        );
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
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
  } catch (error: any) {
    console.error('LLM error:', error);

    // Handle different error types
    const llmError = error as LLMError;

    // For retryable errors, use fallback
    if (llmError.retryable) {
      return getFallbackResponse(userMessage, llmError.message);
    }

    // For non-retryable errors (quota, auth), return error message
    if (llmError.code === 'QUOTA_EXCEEDED' || llmError.code === 'AUTH_ERROR') {
      return `抱歉，${llmError.message} 請稍後再試或聯繫管理員。`;
    }

    // For other errors, use fallback
    return getFallbackResponse(userMessage, llmError.message);
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
    return '你好！我是你的 AI 助手。目前服務暫時無法使用，但我可以處理基本的問候。有什麼我可以幫你的嗎？';
  }

  // Question responses
  if (lowerMessage.includes('?') || lowerMessage.includes('？')) {
    return `我理解你的問題：「${userMessage}」。目前 AI 服務暫時無法使用，請稍後再試。`;
  }

  // Default fallback
  return `收到你的訊息：「${userMessage}」。目前 AI 服務暫時無法使用（${errorMessage || '服務錯誤'}），請稍後再試。`;
}

