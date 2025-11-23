import { withDatabase } from '@/lib/utils/withDatabase';
import Message, { type IMessage, type MessageRole, type MessageType } from '@/lib/models/Message';
import type { IMessageRepository } from '../IMessageRepository';
import type mongoose from 'mongoose';

/**
 * Mongoose implementation of Message Repository
 */
class MessageRepository implements IMessageRepository {
  async findById(messageId: string | mongoose.Types.ObjectId): Promise<IMessage | null> {
    return await withDatabase(async () => {
      return await Message.findById(messageId);
    })();
  }

  async create(messageData: {
    conversationId: mongoose.Types.ObjectId;
    role: MessageRole;
    type: MessageType;
    content: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<IMessage> {
    return await withDatabase(async () => {
      return await Message.create({
        conversationId: messageData.conversationId,
        role: messageData.role,
        type: messageData.type,
        content: messageData.content,
        metadata: messageData.metadata || {},
        timestamp: messageData.timestamp || new Date(),
      });
    })();
  }

  async findByConversationId(
    conversationId: string | mongoose.Types.ObjectId,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    }
  ): Promise<IMessage[]> {
    return await withDatabase(async () => {
      const query = Message.find({ conversationId });

      if (options?.sort) {
        query.sort(options.sort);
      }

      if (options?.skip) {
        query.skip(options.skip);
      }

      if (options?.limit) {
        query.limit(options.limit);
      }

      return await query.exec();
    })();
  }

  async getConversationHistory(
    conversationId: string | mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    return await withDatabase(async () => {
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
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content,
          }));
      } catch (error) {
        console.error('Error getting conversation history:', error);
        return [];
      }
    })();
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return await withDatabase(async () => {
      return await Message.countDocuments(filter || {});
    })();
  }

  async countByConversationIds(conversationIds: mongoose.Types.ObjectId[]): Promise<number> {
    return await withDatabase(async () => {
      return await Message.countDocuments({
        conversationId: { $in: conversationIds },
      });
    })();
  }
}

// Export singleton instance
export const messageRepository = new MessageRepository();
export default messageRepository;

