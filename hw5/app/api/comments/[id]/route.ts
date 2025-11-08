import { NextRequest } from 'next/server'
import { withErrorHandling, withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { commentIdSchema } from '@/lib/validation/schemas/params.schema'
import { requireOwnership } from '@/lib/api/middleware/auth'
import { getPostById, findRootPost, getPostRepliesRecursive, deletePost, getPostReplyCount } from '@/lib/db/queries/posts'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { broadcastEvent, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

/**
 * GET /api/comments/[id]
 * Get a single comment (Post with parentId) with its replies
 */
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await validateParams(await params, commentIdSchema)

  // Get comment (which is a Post with parentId) using query builder
  const comment = await getPostById(id)

  if (!comment) {
    throw {
      error: 'Comment not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Get parent post if exists
  let parent = null
  if (comment.parentId) {
    parent = await getPostById(comment.parentId)
  }

  // Find the root post (original post this comment is on)
  const rootPostId = await findRootPost(comment.id)
  const rootPost = rootPostId ? await getPostById(rootPostId) : null

  // Fetch nested replies using query builder
  const replies = await getPostRepliesRecursive(comment.id)

  return successResponse({
    comment: {
      ...comment,
      parent,
      post: rootPost, // Original post this comment is on
      replies,
    },
  })
})

/**
 * DELETE /api/comments/[id]
 * Delete a comment (Post with parentId)
 */
export const DELETE = withAuth(async (request, { params, session }) => {
  const { id } = await validateParams(await params, commentIdSchema)

  // Get comment to check ownership
  const comment = await getPostById(id)

  if (!comment) {
    throw {
      error: 'Comment not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  requireOwnership(comment.authorId, session.user.id)

  // Find the root post before deleting
  const rootPostId = await findRootPost(id)

  // Delete comment using query builder (cascade will delete replies)
  await deletePost(id)

  // Broadcast comment deleted event if we have a root post
  if (rootPostId) {
    const replyCount = await getPostReplyCount(rootPostId)
    
    await broadcastEvent(
      PUSHER_CHANNELS.post(rootPostId),
      PUSHER_EVENTS.COMMENT_DELETED,
      {
        postId: rootPostId,
        commentId: id,
        userId: session.user.id,
        count: replyCount,
      }
    )
  }

  return successResponse({ success: true })
})
