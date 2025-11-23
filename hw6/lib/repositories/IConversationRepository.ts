import type { IConversation } from '@/lib/models/Conversation';
import type mongoose from 'mongoose';

/**
 * Conversation Repository Interface
 * Defines the contract for conversation data access operations
 */
export interface IConversationRepository {
  /**
   * Find conversation by ID
   */
  findById(conversationId: string | mongoose.Types.ObjectId): Promise<IConversation | null>;

  /**
   * Find active conversation for a user
   */
  findActiveByLineUserId(lineUserId: string): Promise<IConversation | null>;

  /**
   * Find conversations by user ID
   */
  findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IConversation[]>;

  /**
   * Create a new conversation
   */
  create(conversationData: {
    userId: mongoose.Types.ObjectId;
    lineUserId: string;
    title?: string;
    messageCount?: number;
    isActive?: boolean;
    startedAt?: Date;
    lastMessageAt?: Date;
  }): Promise<IConversation>;

  /**
   * Update conversation
   */
  update(
    conversationId: string | mongoose.Types.ObjectId,
    updates: Partial<{
      messageCount: number;
      lastMessageAt: Date;
      isActive: boolean;
      endedAt: Date;
      title: string;
    }>
  ): Promise<IConversation | null>;

  /**
   * Increment conversation message count
   */
  incrementMessageCount(conversationId: string | mongoose.Types.ObjectId): Promise<void>;

  /**
   * Mark conversation as inactive
   */
  markInactive(conversationId: string | mongoose.Types.ObjectId): Promise<void>;

  /**
   * Mark all active conversations for a user as inactive
   */
  markAllInactiveByLineUserId(lineUserId: string): Promise<number>;

  /**
   * Count conversations
   */
  count(filter?: Record<string, unknown>): Promise<number>;

  /**
   * Find conversations with pagination
   */
  findMany(options?: {
    filter?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    populate?: string | string[];
  }): Promise<IConversation[]>;
}

