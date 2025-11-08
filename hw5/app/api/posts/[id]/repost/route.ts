import { NextRequest } from 'next/server'
import { withAuth, withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { postIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { broadcastEvent, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

/**
 * POST /api/posts/[id]/repost
 * Toggle repost on a post
 */
export const POST = withAuth(async (request, { params, session }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })

  if (!post) {
    throw {
      error: 'Post not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Check if user already reposted this post
  const existingRepost = await prisma.repost.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: postId,
      },
    },
  })

  if (existingRepost) {
    // Unrepost: delete the repost
    await prisma.repost.delete({
      where: {
        id: existingRepost.id,
      },
    })

    // Get updated count
    const count = await prisma.repost.count({
      where: { postId },
    })

    // Broadcast unrepost event
    await broadcastEvent(
      PUSHER_CHANNELS.post(postId),
      PUSHER_EVENTS.UNREPOST,
      {
        postId,
        userId: session.user.id,
        count,
        reposted: false,
      }
    )

    return successResponse({ reposted: false, count })
  } else {
    // Repost: create the repost
    await prisma.repost.create({
      data: {
        userId: session.user.id,
        postId: postId,
      },
    })

    // Get updated count
    const count = await prisma.repost.count({
      where: { postId },
    })

    // Broadcast repost event
    await broadcastEvent(
      PUSHER_CHANNELS.post(postId),
      PUSHER_EVENTS.REPOST,
      {
        postId,
        userId: session.user.id,
        count,
        reposted: true,
      }
    )

    return successResponse({ reposted: true, count })
  }
})

/**
 * GET /api/posts/[id]/reposted
 * Check if current user reposted the post
 */
export const GET = withOptionalAuth(async (request, { params, session }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)

  if (!session) {
    return successResponse({ reposted: false })
  }

  const repost = await prisma.repost.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: postId,
      },
    },
  })

  return successResponse({ reposted: !!repost })
})

