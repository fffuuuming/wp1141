import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation, Message } from '@/lib/models';
import type { IConversation, IMessage } from '@/lib/models';
import type mongoose from 'mongoose';

/**
 * Get or create active conversation for a user
 */
export const getOrCreateActiveConversation = withDatabase(async (
  userId: mongoose.Types.ObjectId,
  lineUserId: string
): Promise<IConversation> => {
  // Try to find existing active conversation
  let conversation = await Conversation.findOne({
    lineUserId,
    isActive: true,
  });

  if (!conversation) {
    // Create new active conversation
    conversation = await Conversation.create({
      userId,
      lineUserId,
      messageCount: 0,
      isActive: true,
      startedAt: new Date(),
      lastMessageAt: new Date(),
    });

    console.log(`Created new conversation for user: ${lineUserId}`);
  }

  return conversation;
});

/**
 * Update conversation information
 */
export const updateConversation = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId,
  updates: Partial<{
    messageCount: number;
    lastMessageAt: Date;
    isActive: boolean;
    endedAt: Date;
    title: string;
  }>
): Promise<IConversation | null> => {
  const updateData: any = {};

  if (updates.messageCount !== undefined) {
    updateData.messageCount = updates.messageCount;
  }
  if (updates.lastMessageAt !== undefined) {
    updateData.lastMessageAt = updates.lastMessageAt;
  }
  if (updates.isActive !== undefined) {
    updateData.isActive = updates.isActive;
    if (!updates.isActive && !updates.endedAt) {
      updateData.endedAt = new Date();
    }
  }
  if (updates.endedAt !== undefined) {
    updateData.endedAt = updates.endedAt;
  }
  if (updates.title !== undefined) {
    updateData.title = updates.title;
  }

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: updateData },
    { new: true }
  );

  return conversation;
});

/**
 * Increment conversation message count and update last message time
 */
export const incrementConversationMessageCount = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId
): Promise<void> => {
  await Conversation.findByIdAndUpdate(conversationId, {
    $inc: { messageCount: 1 },
    $set: { lastMessageAt: new Date() },
  });
});

/**
 * Save a message to database
 */
export const saveMessage = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId,
  content: string,
  role: 'user' | 'bot',
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker' = 'text',
  metadata?: Record<string, unknown>
): Promise<IMessage> => {
  const message = await Message.create({
    conversationId,
    role,
    type,
    content,
    metadata: metadata || {},
    timestamp: new Date(),
  });

  return message;
});

/**
 * Get conversation history for context
 */
export const getConversationHistory = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId,
  limit: number = 10
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> => {
  try {
    const messages = await Message.find({
      conversationId,
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
});

/**
 * Get conversation by ID
 */
export const getConversationById = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId
): Promise<IConversation | null> => {
  return await Conversation.findById(conversationId);
});

/**
 * Mark conversation as inactive
 */
export const markConversationInactive = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId
): Promise<void> => {
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      isActive: false,
      endedAt: new Date(),
    },
  });
});

/**
 * Mark all active conversations for a user as inactive
 */
export const markAllUserConversationsInactive = withDatabase(async (
  lineUserId: string
): Promise<number> => {
  const result = await Conversation.updateMany(
    { lineUserId, isActive: true },
    {
      $set: {
        isActive: false,
        endedAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
});

