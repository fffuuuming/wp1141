import { NextRequest } from 'next/server'
import { withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { successResponse } from '@/lib/api/helpers/response'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * GET /api/user/search
 * Search for users by username (name) or userID
 * Query params: q (search query), limit (optional, default 10)
 */
export const GET = withOptionalAuth(async (request, { session }) => {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50) // Max 50 results

  if (!query || query.length === 0) {
    return successResponse({ users: [] })
  }

  const currentUserId = session?.user?.id

  // Search by userID (exact or partial match) or name (partial match)
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
          OR: [
            {
              userID: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
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
    orderBy: {
      userID: 'asc',
    },
    take: limit,
  })

  // Check follow status for each user if current user is logged in
  const usersWithFollowStatus = await Promise.all(
    users.map(async (user) => {
      let isFollowing = false
      if (currentUserId && currentUserId !== user.id) {
        const follow = await prisma.follow.findFirst({
          where: {
            followerId: currentUserId,
            followingId: user.id,
          },
        })
        isFollowing = !!follow
      }

      const isOwnProfile = currentUserId === user.id

      return {
        id: user.id,
        userID: user.userID,
        name: user.name,
        image: user.image,
        stats: {
          posts: user._count.posts,
          following: user._count.following,
          followers: user._count.followers,
        },
        isFollowing,
        isOwnProfile,
      }
    })
  )

  return successResponse({ users: usersWithFollowStatus })
})

