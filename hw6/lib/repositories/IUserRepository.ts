import type { IUser } from '@/lib/models/User';
import type mongoose from 'mongoose';

/**
 * User Repository Interface
 * Defines the contract for user data access operations
 */
export interface IUserRepository {
  /**
   * Find user by Line user ID
   */
  findByLineId(lineUserId: string): Promise<IUser | null>;

  /**
   * Find user by MongoDB ID
   */
  findById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null>;

  /**
   * Create a new user
   */
  create(userData: {
    lineUserId: string;
    displayName?: string;
    pictureUrl?: string;
    statusMessage?: string;
    lastActiveAt?: Date;
    messageCount?: number;
  }): Promise<IUser>;

  /**
   * Update user's last active time
   */
  updateLastActive(lineUserId: string): Promise<void>;

  /**
   * Increment user's message count
   */
  incrementMessageCount(lineUserId: string): Promise<void>;

  /**
   * Update user information
   */
  update(
    lineUserId: string,
    updates: Partial<{
      displayName: string;
      pictureUrl: string;
      statusMessage: string;
      lastActiveAt: Date;
      messageCount: number;
    }>
  ): Promise<IUser | null>;

  /**
   * Count total users
   */
  count(): Promise<number>;

  /**
   * Find users with pagination
   */
  findMany(options?: {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<IUser[]>;
}

