import { withDatabase } from '@/lib/utils/withDatabase';
import Conversation, { type IConversation } from '@/lib/models/Conversation';
import type { IConversationRepository } from '../IConversationRepository';
import type mongoose from 'mongoose';

/**
 * Mongoose implementation of Conversation Repository
 */
class ConversationRepository implements IConversationRepository {
  async findById(conversationId: string | mongoose.Types.ObjectId): Promise<IConversation | null> {
    return await withDatabase(async () => {
      return await Conversation.findById(conversationId);
    })();
  }

  async findActiveByLineUserId(lineUserId: string): Promise<IConversation | null> {
    return await withDatabase(async () => {
      return await Conversation.findOne({
        lineUserId,
        isActive: true,
      });
    })();
  }

  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IConversation[]> {
    return await withDatabase(async () => {
      return await Conversation.find({ userId }).sort({ lastMessageAt: -1 }).exec();
    })();
  }

  async create(conversationData: {
    userId: mongoose.Types.ObjectId;
    lineUserId: string;
    title?: string;
    messageCount?: number;
    isActive?: boolean;
    startedAt?: Date;
    lastMessageAt?: Date;
  }): Promise<IConversation> {
    return await withDatabase(async () => {
      return await Conversation.create({
        userId: conversationData.userId,
        lineUserId: conversationData.lineUserId,
        title: conversationData.title,
        messageCount: conversationData.messageCount || 0,
        isActive: conversationData.isActive !== undefined ? conversationData.isActive : true,
        startedAt: conversationData.startedAt || new Date(),
        lastMessageAt: conversationData.lastMessageAt || new Date(),
      });
    })();
  }

  async update(
    conversationId: string | mongoose.Types.ObjectId,
    updates: Partial<{
      messageCount: number;
      lastMessageAt: Date;
      isActive: boolean;
      endedAt: Date;
      title: string;
    }>
  ): Promise<IConversation | null> {
    return await withDatabase(async () => {
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

      return await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: updateData },
        { new: true }
      );
    })();
  }

  async incrementMessageCount(conversationId: string | mongoose.Types.ObjectId): Promise<void> {
    await withDatabase(async () => {
      await Conversation.findByIdAndUpdate(conversationId, {
        $inc: { messageCount: 1 },
        $set: { lastMessageAt: new Date() },
      });
    })();
  }

  async markInactive(conversationId: string | mongoose.Types.ObjectId): Promise<void> {
    await withDatabase(async () => {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: {
          isActive: false,
          endedAt: new Date(),
        },
      });
    })();
  }

  async markAllInactiveByLineUserId(lineUserId: string): Promise<number> {
    return await withDatabase(async () => {
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
    })();
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return await withDatabase(async () => {
      return await Conversation.countDocuments(filter || {});
    })();
  }

  async findMany(options?: {
    filter?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    populate?: string | string[];
  }): Promise<IConversation[]> {
    return await withDatabase(async () => {
      const query = Conversation.find(options?.filter || {});

      if (options?.sort) {
        query.sort(options.sort);
      }

      if (options?.skip) {
        query.skip(options.skip);
      }

      if (options?.limit) {
        query.limit(options.limit);
      }

      if (options?.populate) {
        query.populate(options.populate);
      }

      return await query.exec();
    })();
  }
}

// Export singleton instance
export const conversationRepository = new ConversationRepository();
export default conversationRepository;

