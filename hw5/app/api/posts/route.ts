import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { createPostSchema } from '@/lib/validation/schemas/post.schema'
import { calculateCharacterCount } from '@/lib/postUtils'
import { createPost } from '@/lib/db/queries/posts'
import { POST_CONTENT } from '@/lib/constants/validation'
import { HttpStatus, ErrorCode } from '@/types/api/errors'
import { throwError } from '@/lib/errors/handlers'
import { prisma } from '@/lib/prisma'
import { broadcastEvent, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

/**
 * POST /api/posts
 * Create a new post
 */
export const POST = withAuth(async (request, { session }) => {
  // Validate request body
  const { content } = await validateRequest(request, createPostSchema)

  // Trim content
  const trimmedContent = content.trim()

  // Check character count
  const charCount = calculateCharacterCount(trimmedContent)

  if (charCount > POST_CONTENT.MAX_CHARS) {
    throwError(
      ErrorCode.CHARACTER_LIMIT_EXCEEDED,
      HttpStatus.BAD_REQUEST,
      `Post exceeds ${POST_CONTENT.MAX_CHARS} character limit (current: ${charCount})`,
      { charCount, maxChars: POST_CONTENT.MAX_CHARS }
    )
  }

  // Create post using query builder
  const post = await createPost({
    authorId: session.user.id,
    content: trimmedContent,
  })

  // Get author info for broadcasting
  const author = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      userID: true,
      name: true,
      image: true,
    },
  })

  // Get all followers of the author
  const followers = await prisma.follow.findMany({
    where: { followingId: session.user.id },
    select: {
      follower: {
        select: {
          userID: true,
        },
      },
    },
  })

  // Broadcast to feed channel and each follower's user channel
  if (author) {
    // Broadcast to global feed channel (for clients to filter)
    await broadcastEvent(
      PUSHER_CHANNELS.feed,
      PUSHER_EVENTS.POST_CREATED,
      {
        postId: post.id,
        userId: session.user.id,
        author: {
          id: author.id,
          userID: author.userID,
          name: author.name,
          image: author.image,
        },
      }
    )

    // Also broadcast to each follower's user channel for direct notifications
    for (const follow of followers) {
      await broadcastEvent(
        PUSHER_CHANNELS.user(follow.follower.userID),
        PUSHER_EVENTS.POST_CREATED,
        {
          postId: post.id,
          userId: session.user.id,
          author: {
            id: author.id,
            userID: author.userID,
            name: author.name,
            image: author.image,
          },
        }
      )
    }
  }

  return successResponse({ post })
})

