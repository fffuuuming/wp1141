import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest, validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { createCommentSchema } from '@/lib/validation/schemas/post.schema'
import { commentIdSchema } from '@/lib/validation/schemas/params.schema'
import { getPostById, createPost, findRootPost, getPostReplyCount } from '@/lib/db/queries/posts'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { broadcastEvent, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

/**
 * POST /api/comments/[id]/replies
 * Create a reply to a comment (which is a Post with parentId)
 */
export const POST = withAuth(async (request, { params, session }) => {
  const { id: parentId } = await validateParams(await params, commentIdSchema)
  const { content } = await validateRequest(request, createCommentSchema)

  // Check if parent comment exists (it's a Post with parentId)
  const parentComment = await getPostById(parentId)

  if (!parentComment) {
    throw {
      error: 'Parent comment not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Create reply using query builder
  const reply = await createPost({
    authorId: session.user.id,
    parentId: parentId, // Reply to the parent comment
    content: content.trim(),
  })

  // Find the root post to broadcast to the correct channel
  const rootPostId = await findRootPost(parentId)
  if (rootPostId) {
    // Get updated reply count for the root post
    const replyCount = await getPostReplyCount(rootPostId)
    
    // Broadcast comment created event
    await broadcastEvent(
      PUSHER_CHANNELS.post(rootPostId),
      PUSHER_EVENTS.COMMENT_CREATED,
      {
        postId: rootPostId,
        commentId: reply.id,
        userId: session.user.id,
        count: replyCount,
      }
    )
  }

  return successResponse({ comment: reply })
})

