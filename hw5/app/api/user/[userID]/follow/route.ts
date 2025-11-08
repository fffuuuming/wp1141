import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { broadcastEvent, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

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

  // Get updated follower count for target user
  const followerCount = await prisma.follow.count({
    where: { followingId: targetUser.id },
  })

  // Get updated following count for current user
  const followingCount = await prisma.follow.count({
    where: { followerId: session.user.id },
  })

  // Get current user's userID for broadcasting
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userID: true },
  })

  // Broadcast follow event to target user's channel (for follower count)
  await broadcastEvent(
    PUSHER_CHANNELS.user(userID),
    PUSHER_EVENTS.FOLLOW,
    {
      userID,
      followerId: session.user.id,
      followerCount,
      following: true,
    }
  )

  // Broadcast to current user's channel (for following count) if they have a userID
  if (currentUser?.userID) {
    await broadcastEvent(
      PUSHER_CHANNELS.user(currentUser.userID),
      PUSHER_EVENTS.FOLLOW,
      {
        userID: currentUser.userID,
        followerId: session.user.id,
        followingCount,
        following: true,
      }
    )
  }

  return successResponse({ success: true, followerCount, followingCount })
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

  // Get updated follower count for target user
  const followerCount = await prisma.follow.count({
    where: { followingId: targetUser.id },
  })

  // Get updated following count for current user
  const followingCount = await prisma.follow.count({
    where: { followerId: session.user.id },
  })

  // Get current user's userID for broadcasting
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userID: true },
  })

  // Broadcast unfollow event to target user's channel (for follower count)
  await broadcastEvent(
    PUSHER_CHANNELS.user(userID),
    PUSHER_EVENTS.UNFOLLOW,
    {
      userID,
      followerId: session.user.id,
      followerCount,
      following: false,
    }
  )

  // Broadcast to current user's channel (for following count) if they have a userID
  if (currentUser?.userID) {
    await broadcastEvent(
      PUSHER_CHANNELS.user(currentUser.userID),
      PUSHER_EVENTS.UNFOLLOW,
      {
        userID: currentUser.userID,
        followerId: session.user.id,
        followingCount,
        following: false,
      }
    )
  }

  return successResponse({ success: true, followerCount, followingCount })
})

