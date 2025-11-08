import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { successResponse } from '@/lib/api/helpers/response'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/recommendations
 * Get up to 3 random user recommendations (excluding current user and users already followed)
 */
export const GET = withAuth(async (request, { session }) => {
  const currentUserId = session.user.id

  // Get list of user IDs that current user is already following
  const following = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
    },
    select: {
      followingId: true,
    },
  })

  const followingIds = following.map((f) => f.followingId)

  // Get random users (excluding current user and users already followed)
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          NOT: {
            userID: {
              startsWith: 'temp_',
            },
          },
        },
        {
          provider: {
            not: '',
          },
        },
        {
          id: {
            not: currentUserId,
          },
        },
        {
          id: {
            notIn: followingIds,
          },
        },
      ],
    },
    select: {
      id: true,
      userID: true,
      name: true,
      image: true,
      _count: {
        select: {
          posts: true,
          following: true,
          followers: true,
        },
      },
    },
    take: 10, // Get more than needed for randomization
  })

  // Randomly select up to 3 users
  const shuffled = users.sort(() => Math.random() - 0.5)
  const recommendedUsers = shuffled.slice(0, 3)

  // Add follow status (should be false for all since we excluded followed users)
  const usersWithFollowStatus = recommendedUsers.map((user) => ({
    id: user.id,
    userID: user.userID,
    name: user.name,
    image: user.image,
    stats: {
      posts: user._count.posts,
      following: user._count.following,
      followers: user._count.followers,
    },
    isFollowing: false,
    isOwnProfile: false,
  }))

  return successResponse({ users: usersWithFollowStatus })
})

