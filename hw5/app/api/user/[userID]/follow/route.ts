import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * POST /api/user/[userID]/follow
 * Follow a user
 */
export const POST = withAuth(async (request, { params, session }) => {
  const { userID } = await validateParams(await params, userIdSchema)

  // Find target user
  const targetUser = await prisma.user.findUnique({
    where: { userID },
    select: { id: true },
  })

  if (!targetUser) {
    throw {
      error: 'User not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Can't follow yourself
  if (targetUser.id === session.user.id) {
    throw {
      error: 'You cannot follow yourself',
      code: ErrorCode.VALIDATION_ERROR,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  // Check if already following
  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: session.user.id,
      followingId: targetUser.id,
    },
  })

  if (existingFollow) {
    throw {
      error: 'Already following this user',
      code: ErrorCode.ALREADY_EXISTS,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  // Create follow relationship
  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: targetUser.id,
    },
  })

  return successResponse({ success: true })
})

/**
 * DELETE /api/user/[userID]/follow
 * Unfollow a user
 */
export const DELETE = withAuth(async (request, { params, session }) => {
  const { userID } = await validateParams(await params, userIdSchema)

  // Find target user
  const targetUser = await prisma.user.findUnique({
    where: { userID },
    select: { id: true },
  })

  if (!targetUser) {
    throw {
      error: 'User not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Find and delete follow relationship
  const follow = await prisma.follow.findFirst({
    where: {
      followerId: session.user.id,
      followingId: targetUser.id,
    },
  })

  if (!follow) {
    throw {
      error: 'Not following this user',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  await prisma.follow.delete({
    where: { id: follow.id },
  })

  return successResponse({ success: true })
})

