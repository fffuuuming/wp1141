import { NextRequest } from 'next/server'
import { withErrorHandling, withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse, notFoundResponse } from '@/lib/api/helpers/response'
import { postIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { postWithParentInclude } from '@/types/entities/post'
import { requireOwnership } from '@/lib/api/middleware/auth'

/**
 * GET /api/posts/[id]
 * Get a single post by ID
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await validateParams(await params, postIdSchema)

  const post = await prisma.post.findUnique({
    where: { id },
    include: postWithParentInclude,
  })

  if (!post) {
    throw {
      error: 'Post not found',
      status: 404,
    }
  }

  return successResponse({ post })
})

/**
 * DELETE /api/posts/[id]
 * Delete a post (only by author)
 */
export const DELETE = withAuth(async (request, { params, session }) => {
  const { id } = await validateParams(await params, postIdSchema)

  // Verify post exists and belongs to user
  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true },
  })

  if (!post) {
    throw {
      error: 'Post not found',
      status: 404,
    }
  }

  requireOwnership(post.authorId, session.user.id)

  await prisma.post.delete({
    where: { id },
  })

  return successResponse({ success: true })
})

