import { NextRequest } from 'next/server'
import { withErrorHandling, withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { commentIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { requireOwnership } from '@/lib/api/middleware/auth'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * Recursively fetch replies for a comment
 */
async function fetchCommentReplies(parentId: string): Promise<any[]> {
  const replies = await prisma.comment.findMany({
    where: {
      parentId: parentId,
    },
    include: {
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
      const nestedReplies = await fetchCommentReplies(reply.id)
      return {
        ...reply,
        replies: nestedReplies,
      }
    })
  )

  return repliesWithNested
}

/**
 * GET /api/comments/[id]
 * Get a single comment with its replies
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await validateParams(await params, commentIdSchema)

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
          createdAt: true,
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
              comments: true,
              reposts: true,
            },
          },
        },
      },
      parent: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              userID: true,
              name: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
  })

  if (!comment) {
    throw {
      error: 'Comment not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Fetch nested replies
  const replies = await fetchCommentReplies(comment.id)

  return successResponse({
    comment: {
      ...comment,
      replies,
    },
  })
})

/**
 * DELETE /api/comments/[id]
 * Delete a comment
 */
export const DELETE = withAuth(async (request, { params, session }) => {
  const { id } = await validateParams(await params, commentIdSchema)

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: {
      authorId: true,
      postId: true,
    },
  })

  if (!comment) {
    throw {
      error: 'Comment not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  requireOwnership(comment.authorId, session.user.id)

  // Delete comment (cascade will delete replies)
  await prisma.comment.delete({
    where: { id },
  })

  return successResponse({ success: true })
})
