import { NextRequest } from 'next/server'
import { withAuth, withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { postIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * POST /api/posts/[id]/like
 * Toggle like on a post
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

  // Check if user already liked this post
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: postId,
      },
    },
  })

  if (existingLike) {
    // Unlike: delete the like
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    })

    // Get updated count
    const count = await prisma.like.count({
      where: { postId },
    })

    return successResponse({ liked: false, count })
  } else {
    // Like: create the like
    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId: postId,
      },
    })

    // Get updated count
    const count = await prisma.like.count({
      where: { postId },
    })

    return successResponse({ liked: true, count })
  }
})

/**
 * GET /api/posts/[id]/liked
 * Check if current user liked the post
 */
export const GET = withOptionalAuth(async (request, { params, session }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)

  if (!session) {
    return successResponse({ liked: false })
  }

  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: postId,
      },
    },
  })

  return successResponse({ liked: !!like })
})

