import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateRequest } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { createPostSchema } from '@/lib/validation/schemas/post.schema'
import { calculateCharacterCount } from '@/lib/postUtils'
import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

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
  const maxChars = 280

  if (charCount > maxChars) {
    throw {
      error: `Post exceeds ${maxChars} character limit (current: ${charCount})`,
      code: ErrorCode.CHARACTER_LIMIT_EXCEEDED,
      status: HttpStatus.BAD_REQUEST,
    }
  }

  // Create post
  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content: trimmedContent,
    },
    include: postWithDetailsInclude,
  })

  return successResponse({ post })
})

