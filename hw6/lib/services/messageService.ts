import connectDB from '@/lib/utils/mongodb';
import { User, Conversation, Message } from '@/lib/models';
import { getUserProfile, sendTextMessage, type WebhookEvent } from './lineService';

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

    // Generate reply (basic echo for now, will integrate LLM later)
    const replyText = await generateReply(messageText, conversation._id.toString());

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
 * Generate reply message (basic implementation, will be enhanced with LLM)
 */
async function generateReply(
  userMessage: string,
  conversationId: string
): Promise<string> {
  // Basic greeting responses
  const lowerMessage = userMessage.toLowerCase().trim();

  if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === '你好') {
    return '你好！我是你的 AI 助手，有什麼可以幫你的嗎？';
  }

  if (lowerMessage === 'help' || lowerMessage === '幫助' || lowerMessage === '說明') {
    return '我可以幫助你回答問題、提供資訊，或進行對話。請告訴我你需要什麼協助！';
  }

  // Default echo response (will be replaced with LLM)
  return `收到你的訊息：「${userMessage}」。我正在學習如何更好地回應，請稍候！`;
}

