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

  return successResponse({ post })
})

