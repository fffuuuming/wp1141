import type { IMessage, MessageRole, MessageType } from '@/lib/models/Message';
import type mongoose from 'mongoose';

/**
 * Message Repository Interface
 * Defines the contract for message data access operations
 */
export interface IMessageRepository {
  /**
   * Find message by ID
   */
  findById(messageId: string | mongoose.Types.ObjectId): Promise<IMessage | null>;

  /**
   * Create a new message
   */
  create(messageData: {
    conversationId: mongoose.Types.ObjectId;
    role: MessageRole;
    type: MessageType;
    content: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<IMessage>;

  /**
   * Find messages by conversation ID
   */
  findByConversationId(
    conversationId: string | mongoose.Types.ObjectId,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    }
  ): Promise<IMessage[]>;

  /**
   * Get conversation history (for LLM context)
   */
  getConversationHistory(
    conversationId: string | mongoose.Types.ObjectId,
    limit?: number
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>>;

  /**
   * Count messages
   */
  count(filter?: Record<string, unknown>): Promise<number>;

  /**
   * Count messages by conversation IDs
   */
  countByConversationIds(conversationIds: mongoose.Types.ObjectId[]): Promise<number>;
}

