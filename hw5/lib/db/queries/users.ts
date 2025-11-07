/**
 * User Query Builders
 * Centralized Prisma query builders for user-related queries
 */

import { prisma } from '@/lib/prisma'
import { userBasicSelect } from '@/types/entities/user'

/**
 * Get user by ID with basic info
 */
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: userBasicSelect,
  })
}

/**
 * Get user by userID with basic info
 */
export async function getUserByUserID(userID: string) {
  return await prisma.user.findUnique({
    where: { userID },
    select: userBasicSelect,
  })
}

/**
 * Get user with full profile info
 */
export async function getUserProfile(userID: string) {
  return await prisma.user.findUnique({
    where: { userID },
    select: {
      id: true,
      userID: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      backgroundImage: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          following: true,
          followers: true,
        },
      },
    },
  })
}

/**
 * Check if user A follows user B
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })
  return !!follow
}

/**
 * Get users that a user follows
 */
export async function getFollowing(userId: string) {
  return await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      following: {
        select: userBasicSelect,
      },
    },
  })
}

/**
 * Get users that follow a user
 */
export async function getFollowers(userId: string) {
  return await prisma.follow.findMany({
    where: { followingId: userId },
    select: {
      follower: {
        select: userBasicSelect,
      },
    },
  })
}

