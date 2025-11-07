import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { requireOwnership } from '@/lib/api/middleware/auth'
import { postWithDetailsInclude } from '@/types/entities/post'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * GET /api/user/[userID]/likes
 * Get posts that the user has liked (only accessible by the user themselves)
 */
export const GET = withAuth(async (request, { params, session }) => {
  const { userID } = await validateParams(await params, userIdSchema)

  // Find user by userID
  const user = await prisma.user.findUnique({
    where: { userID },
    select: { id: true },
  })

  if (!user) {
    throw {
      error: 'User not found',
      code: ErrorCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }
  }

  // Only allow users to see their own likes
  requireOwnership(user.id, session.user.id)

  // Fetch liked posts
  const likes = await prisma.like.findMany({
    where: {
      userId: user.id,
    },
    include: {
      post: {
        include: postWithDetailsInclude,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return successResponse({
    likedPosts: likes.map((like) => ({
      id: like.id,
      post: like.post,
      createdAt: like.createdAt.toISOString(),
    })),
  })
})
