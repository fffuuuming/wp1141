import { withDatabase } from '@/lib/utils/withDatabase';
import {
  conversationRepository,
  messageRepository,
} from '@/lib/repositories/mongoose';
import type { IConversation, IMessage } from '@/lib/models';
import type mongoose from 'mongoose';
import { logger } from '@/lib/utils/logger';
import { CONVERSATION_HISTORY_LIMIT } from '@/lib/constants/llm';

/**
 * Get or create active conversation for a user
 */
export const getOrCreateActiveConversation = withDatabase(async (
  userId: mongoose.Types.ObjectId,
  lineUserId: string
): Promise<IConversation> => {
  // Try to find existing active conversation
  let conversation = await conversationRepository.findActiveByLineUserId(lineUserId);

  if (!conversation) {
    // Create new active conversation
    conversation = await conversationRepository.create({
      userId,
      lineUserId,
      messageCount: 0,
      isActive: true,
      startedAt: new Date(),
      lastMessageAt: new Date(),
    });

    logger.info('Created new conversation', { lineUserId });
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
  return await conversationRepository.update(conversationId, updates);
});

/**
 * Increment conversation message count and update last message time
 */
export const incrementConversationMessageCount = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId
): Promise<void> => {
  await conversationRepository.incrementMessageCount(conversationId);
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
  return await messageRepository.create({
    conversationId: conversationId as mongoose.Types.ObjectId,
    role,
    type,
    content,
    metadata,
  });
});

/**
 * Get conversation history for context
 */
export const getConversationHistory = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId,
  limit: number = CONVERSATION_HISTORY_LIMIT
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> => {
  return await messageRepository.getConversationHistory(conversationId, limit);
});

/**
 * Get conversation by ID
 */
export const getConversationById = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId
): Promise<IConversation | null> => {
  return await conversationRepository.findById(conversationId);
});

/**
 * Mark conversation as inactive
 */
export const markConversationInactive = withDatabase(async (
  conversationId: string | mongoose.Types.ObjectId
): Promise<void> => {
  await conversationRepository.markInactive(conversationId);
});

/**
 * Mark all active conversations for a user as inactive
 */
export const markAllUserConversationsInactive = withDatabase(async (
  lineUserId: string
): Promise<number> => {
  return await conversationRepository.markAllInactiveByLineUserId(lineUserId);
});

