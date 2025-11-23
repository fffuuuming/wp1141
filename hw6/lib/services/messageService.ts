import connectDB from '@/lib/utils/mongodb';
import { User, Conversation, Message } from '@/lib/models';
import { getUserProfile, sendTextMessage, type WebhookEvent } from './lineService';
import { llmService, type LLMError } from './llmService';
import { isCommand, handleCommand } from './botLogicService';

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

  try {
    // Connect to database
    await connectDB();

    // Get or create user
    let user = await User.findOne({ lineUserId: userId });
    
    if (!user) {
      // Get user profile from Line
      const profile = await getUserProfile(userId);
      
      // Create new user
      user = await User.create({
        lineUserId: userId,
        displayName: profile?.displayName,
        pictureUrl: profile?.pictureUrl,
        statusMessage: profile?.statusMessage,
        lastActiveAt: new Date(),
        messageCount: 0,
      });
    } else {
      // Update last active time
      user.lastActiveAt = new Date();
      await user.save();
    }

    // Get or create active conversation
    let conversation = await Conversation.findOne({
      lineUserId: userId,
      isActive: true,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        userId: user._id,
        lineUserId: userId,
        messageCount: 0,
        isActive: true,
        startedAt: new Date(),
        lastMessageAt: new Date(),
      });
    }

    // Save incoming message
    const message = await Message.create({
      conversationId: conversation._id,
      role: 'user',
      type: 'text',
      content: messageText,
      timestamp: new Date(),
    });

    // Update conversation
    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Update user message count
    user.messageCount += 1;
    await user.save();

    // Check if message is a command
    if (isCommand(messageText)) {
      const commandReply = await handleCommand(messageText, userId, replyToken);
      if (commandReply) {
        // Save command response
        await Message.create({
          conversationId: conversation._id,
          role: 'bot',
          type: 'text',
          content: commandReply,
          timestamp: new Date(),
        });

        // Send command response
        await sendTextMessage(replyToken, commandReply);
        console.log(`Command processed: ${messageText} from ${userId}`);
        return;
      }
    }

    // Get conversation history for context
    const conversationHistory = await getConversationHistory(conversation._id.toString());

    // Generate reply using LLM with fallback
    const replyText = await generateReply(messageText, conversationHistory);

    // Save bot reply
    await Message.create({
      conversationId: conversation._id,
      role: 'bot',
      type: 'text',
      content: replyText,
      timestamp: new Date(),
    });

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
}

/**
 * Get conversation history for context
 */
async function getConversationHistory(
  conversationId: string,
  limit: number = 10
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  try {
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('role content')
      .lean();

    // Reverse to get chronological order
    return messages
      .reverse()
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
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

