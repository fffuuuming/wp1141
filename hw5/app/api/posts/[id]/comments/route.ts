import { NextRequest } from 'next/server'
import { withAuth, withErrorHandling } from '@/lib/api/handlers/wrapper'
import { validateRequest, validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { createCommentSchema } from '@/lib/validation/schemas/post.schema'
import { postIdSchema } from '@/lib/validation/schemas/params.schema'
import { getPostById, createPost, getPostReplyCount, getPostRepliesRecursive } from '@/lib/db/queries/posts'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * POST /api/posts/[id]/comments
 * Create a reply (sub-post) on a post
 */
export const POST = withAuth(async (request, { params, session }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)
  const { content } = await validateRequest(request, createCommentSchema)

  // Check if parent post exists
  const parentPost = await getPostById(postId)

  if (!parentPost) {
    throw {
      error: 'Post not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Create reply (sub-post) using query builder
  const reply = await createPost({
    authorId: session.user.id,
    parentId: postId,
    content: content.trim(),
  })

  // Get updated reply count
  const replyCount = await getPostReplyCount(postId)

  return successResponse({ post: reply, count: replyCount })
})

/**
 * GET /api/posts/[id]/comments
 * Get replies (sub-posts) for a post (with nested replies)
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)

  // Get replies with nested structure using query builder
  const repliesWithNested = await getPostRepliesRecursive(postId)

  return successResponse({ comments: repliesWithNested })
})

