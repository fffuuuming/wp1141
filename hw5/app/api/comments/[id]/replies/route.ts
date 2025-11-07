import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest, validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { createCommentSchema } from '@/lib/validation/schemas/post.schema'
import { commentIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { commentWithDetailsInclude } from '@/types/entities/comment'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * POST /api/comments/[id]/replies
 * Create a reply to a comment
 */
export const POST = withAuth(async (request, { params, session }) => {
  const { id: parentId } = await validateParams(await params, commentIdSchema)
  const { content } = await validateRequest(request, createCommentSchema)

  // Check if parent comment exists
  const parentComment = await prisma.comment.findUnique({
    where: { id: parentId },
    select: {
      id: true,
      postId: true,
    },
  })

  if (!parentComment) {
    throw {
      error: 'Parent comment not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Create reply
  const reply = await prisma.comment.create({
    data: {
      authorId: session.user.id,
      postId: parentComment.postId, // Keep reference to original post
      parentId: parentId,
      content: content.trim(),
    },
    include: commentWithDetailsInclude,
  })

  return successResponse({ comment: reply })
})

