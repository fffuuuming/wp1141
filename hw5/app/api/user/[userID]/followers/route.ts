import { NextRequest } from 'next/server'
import { withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { userBasicSelect } from '@/types/entities/user'

/**
 * GET /api/user/[userID]/followers
 * Get list of users that follow the specified user
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

  // Get followers
  const follows = await prisma.follow.findMany({
    where: { followingId: user.id },
    select: {
      follower: {
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
          in: follows.map(f => f.follower.id),
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
  const followers = follows.map(f => ({
    ...f.follower,
    isFollowing: followingMap.get(f.follower.id) || false,
  }))

  return successResponse({ followers })
})

