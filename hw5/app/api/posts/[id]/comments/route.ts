import { NextRequest } from 'next/server'
import { withAuth, withErrorHandling } from '@/lib/api/handlers/wrapper'
import { validateRequest, validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { createCommentSchema } from '@/lib/validation/schemas/post.schema'
import { postIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * POST /api/posts/[id]/comments
 * Create a reply (sub-post) on a post
 */
export const POST = withAuth(async (request, { params, session }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)
  const { content } = await validateRequest(request, createCommentSchema)

  // Check if parent post exists
  const parentPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })

  if (!parentPost) {
    throw {
      error: 'Post not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Create reply (sub-post)
  const reply = await prisma.post.create({
    data: {
      authorId: session.user.id,
      parentId: postId,
      content: content.trim(),
    },
    include: postWithDetailsInclude,
  })

  // Get updated reply count
  const replyCount = await prisma.post.count({
    where: { parentId: postId },
  })

  return successResponse({ post: reply, count: replyCount })
})

/**
 * Recursively fetch replies for a post
 */
async function fetchPostReplies(parentId: string): Promise<any[]> {
  const replies = await prisma.post.findMany({
    where: {
      parentId: parentId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Recursively fetch nested replies
  const repliesWithNested = await Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await fetchPostReplies(reply.id)
      return {
        ...reply,
        replies: nestedReplies,
      }
    })
  )

  return repliesWithNested
}

/**
 * GET /api/posts/[id]/comments
 * Get replies (sub-posts) for a post (with nested replies)
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)

  // Get direct replies (sub-posts) to this post
  const replies = await prisma.post.findMany({
    where: {
      parentId: postId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Fetch nested replies for each reply
  const repliesWithNested = await Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await fetchPostReplies(reply.id)
      return {
        ...reply,
        replies: nestedReplies,
      }
    })
  )

  return successResponse({ comments: repliesWithNested })
})

