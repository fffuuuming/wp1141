import { withDatabase } from '@/lib/utils/withDatabase';
import { userRepository } from '@/lib/repositories/mongoose';
import { getUserProfile } from './lineService';
import type { IUser } from '@/lib/models/User';
import { logger } from '@/lib/utils/logger';

/**
 * Get or create user by Line user ID
 * If user doesn't exist, fetch profile from Line and create new user
 * If user exists, update last active time
 */
export const getOrCreateUser = withDatabase(async (
  lineUserId: string,
  options?: {
    updateLastActive?: boolean;
  }
): Promise<IUser> => {
  const { updateLastActive = true } = options || {};

  // Try to find existing user
  let user = await userRepository.findByLineId(lineUserId);

  if (!user) {
    // User doesn't exist, fetch profile from Line
    const profile = await getUserProfile(lineUserId);

    // Create new user
    user = await userRepository.create({
      lineUserId,
      displayName: profile?.displayName,
      pictureUrl: profile?.pictureUrl,
      statusMessage: profile?.statusMessage,
      lastActiveAt: new Date(),
      messageCount: 0,
    });

    logger.info('Created new user', { lineUserId });
  } else if (updateLastActive) {
    // User exists, update last active time
    await userRepository.updateLastActive(lineUserId);
    // Refresh user object
    const refreshedUser = await userRepository.findByLineId(lineUserId);
    if (refreshedUser) {
      user = refreshedUser;
    }
  }

  return user;
});

/**
 * Update user's last active time
 */
export const updateUserLastActive = withDatabase(async (
  lineUserId: string
): Promise<void> => {
  await userRepository.updateLastActive(lineUserId);
});

/**
 * Increment user's message count
 */
export const incrementUserMessageCount = withDatabase(async (
  lineUserId: string
): Promise<void> => {
  await userRepository.incrementMessageCount(lineUserId);
});

/**
 * Get user by Line user ID
 */
export const getUserByLineId = withDatabase(async (
  lineUserId: string
): Promise<IUser | null> => {
  return await userRepository.findByLineId(lineUserId);
});

