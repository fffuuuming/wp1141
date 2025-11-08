import { NextRequest } from 'next/server'
import { withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { userBasicSelect } from '@/types/entities/user'

/**
 * GET /api/user/[userID]/following
 * Get list of users that the specified user follows
 */
export const GET = withOptionalAuth(async (request, { params, session }) => {
  const { userID } = await validateParams(await params, userIdSchema)

  // Find the user
  const user = await prisma.user.findUnique({
    where: { userID },
    select: { id: true },
  })

  if (!user) {
    throw {
      error: 'User not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Get following
  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: {
      following: {
        select: {
          ...userBasicSelect,
          bio: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Check which users the current user follows (if logged in)
  const followingMap = new Map<string, boolean>()
  if (session?.user?.id) {
    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
        followingId: {
          in: follows.map(f => f.following.id),
        },
      },
      select: {
        followingId: true,
      },
    })
    currentUserFollowing.forEach(f => {
      followingMap.set(f.followingId, true)
    })
  }

  // Transform to response format
  const following = follows.map(f => ({
    ...f.following,
    isFollowing: followingMap.get(f.following.id) || false,
  }))

  return successResponse({ following })
})

