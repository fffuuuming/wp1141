import { withDatabase } from '@/lib/utils/withDatabase';
import { User } from '@/lib/models';
import { getUserProfile } from './lineService';
import type { IUser } from '@/lib/models/User';

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
  let user = await User.findOne({ lineUserId });

  if (!user) {
    // User doesn't exist, fetch profile from Line
    const profile = await getUserProfile(lineUserId);

    // Create new user
    user = await User.create({
      lineUserId,
      displayName: profile?.displayName,
      pictureUrl: profile?.pictureUrl,
      statusMessage: profile?.statusMessage,
      lastActiveAt: new Date(),
      messageCount: 0,
    });

    console.log(`Created new user: ${lineUserId}`);
  } else if (updateLastActive) {
    // User exists, update last active time
    user.lastActiveAt = new Date();
    await user.save();
  }

  return user;
});

/**
 * Update user's last active time
 */
export const updateUserLastActive = withDatabase(async (
  lineUserId: string
): Promise<void> => {
  await User.updateOne(
    { lineUserId },
    { $set: { lastActiveAt: new Date() } }
  );
});

/**
 * Increment user's message count
 */
export const incrementUserMessageCount = withDatabase(async (
  lineUserId: string
): Promise<void> => {
  await User.updateOne(
    { lineUserId },
    { $inc: { messageCount: 1 } }
  );
});

/**
 * Get user by Line user ID
 */
export const getUserByLineId = withDatabase(async (
  lineUserId: string
): Promise<IUser | null> => {
  return await User.findOne({ lineUserId });
});

