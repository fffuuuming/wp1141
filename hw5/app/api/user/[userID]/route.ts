import { NextRequest } from 'next/server'
import { withOptionalAuth, withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams, validateRequest } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { updateUserSchema } from '@/lib/validation/schemas/user.schema'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { requireOwnership } from '@/lib/api/middleware/auth'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * GET /api/user/[userID]
 * Fetch user profile data by userID
 */
export const GET = withOptionalAuth(async (request, { params, session }) => {
  const { userID } = await validateParams(await params, userIdSchema)

  // Find user by userID
  const user = await prisma.user.findUnique({
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

  if (!user) {
    throw {
      error: 'User not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  const currentUserId = session?.user?.id

  // Check if current user follows this user
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

  // Check if this is the current user's own profile
  const isOwnProfile = currentUserId === user.id

  return successResponse({
    user: {
      id: user.id,
      userID: user.userID,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      backgroundImage: user.backgroundImage,
      createdAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        following: user._count.following,
        followers: user._count.followers,
      },
    },
    isFollowing,
    isOwnProfile,
  })
})

/**
 * PUT /api/user/[userID]
 * Update user profile (own profile only)
 */
export const PUT = withAuth(async (request, { params, session }) => {
  const { userID } = await validateParams(await params, userIdSchema)
  const data = await validateRequest(request, updateUserSchema)

  // Verify this is the user's own profile
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

  requireOwnership(user.id, session.user.id)

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.backgroundImage !== undefined && { backgroundImage: data.backgroundImage || null }),
      ...(data.image !== undefined && { image: data.image || null }),
      ...(data.name !== undefined && { name: data.name || null }),
    },
    select: {
      id: true,
      userID: true,
      name: true,
      image: true,
      bio: true,
      backgroundImage: true,
    },
  })

  return successResponse({ user: updatedUser })
})

