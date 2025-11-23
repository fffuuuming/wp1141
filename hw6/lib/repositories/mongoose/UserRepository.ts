import { withDatabase } from '@/lib/utils/withDatabase';
import User, { type IUser } from '@/lib/models/User';
import type { IUserRepository } from '../IUserRepository';
import type mongoose from 'mongoose';

/**
 * Mongoose implementation of User Repository
 */
class UserRepository implements IUserRepository {
  async findByLineId(lineUserId: string): Promise<IUser | null> {
    return await withDatabase(async () => {
      return await User.findOne({ lineUserId });
    })();
  }

  async findById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return await withDatabase(async () => {
      return await User.findById(userId);
    })();
  }

  async create(userData: {
    lineUserId: string;
    displayName?: string;
    pictureUrl?: string;
    statusMessage?: string;
    lastActiveAt?: Date;
    messageCount?: number;
  }): Promise<IUser> {
    return await withDatabase(async () => {
      return await User.create({
        lineUserId: userData.lineUserId,
        displayName: userData.displayName,
        pictureUrl: userData.pictureUrl,
        statusMessage: userData.statusMessage,
        lastActiveAt: userData.lastActiveAt || new Date(),
        messageCount: userData.messageCount || 0,
      });
    })();
  }

  async updateLastActive(lineUserId: string): Promise<void> {
    await withDatabase(async () => {
      await User.updateOne(
        { lineUserId },
        { $set: { lastActiveAt: new Date() } }
      );
    })();
  }

  async incrementMessageCount(lineUserId: string): Promise<void> {
    await withDatabase(async () => {
      await User.updateOne(
        { lineUserId },
        { $inc: { messageCount: 1 } }
      );
    })();
  }

  async update(
    lineUserId: string,
    updates: Partial<{
      displayName: string;
      pictureUrl: string;
      statusMessage: string;
      lastActiveAt: Date;
      messageCount: number;
    }>
  ): Promise<IUser | null> {
    return await withDatabase(async () => {
      return await User.findOneAndUpdate(
        { lineUserId },
        { $set: updates },
        { new: true }
      );
    })();
  }

  async count(): Promise<number> {
    return await withDatabase(async () => {
      return await User.countDocuments();
    })();
  }

  async findMany(options?: {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<IUser[]> {
    return await withDatabase(async () => {
      const query = User.find();
      
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
}

// Export singleton instance
export const userRepository = new UserRepository();
export default userRepository;

