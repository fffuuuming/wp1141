/**
 * Feed Query Builders
 * Centralized Prisma query builders for feed-related queries
 */

import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'
import type { PostWithDetails } from '@/types/entities/post'

/**
 * Get feed posts (all or following)
 */
export async function getFeedPosts(
  userId: string,
  filter: 'all' | 'following' = 'all'
): Promise<PostWithDetails[]> {
  if (filter === 'following') {
    // Get posts from users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followingIds = following.map(f => f.followingId)

    if (followingIds.length === 0) {
      // User doesn't follow anyone, return empty array
      return []
    }

    return await prisma.post.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
        parentId: null, // Only top-level posts
      },
      include: postWithDetailsInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  } else {
    // Get all top-level posts (no parent)
    return await prisma.post.findMany({
      where: {
        parentId: null, // Only top-level posts
      },
      include: postWithDetailsInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}

