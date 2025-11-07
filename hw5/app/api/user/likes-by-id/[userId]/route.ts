import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdParamSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { requireOwnership } from '@/lib/api/middleware/auth'
import { postWithDetailsInclude } from '@/types/entities/post'

/**
 * GET /api/user/likes-by-id/[userId]
 * Get posts that the user has liked by database user ID (only accessible by the user themselves)
 */
export const GET = withAuth(async (request, { params, session }) => {
  const { userId } = await validateParams(await params, userIdParamSchema)

  // Only allow users to see their own likes
  requireOwnership(userId, session.user.id)

  // Fetch liked posts
  const likes = await prisma.like.findMany({
    where: {
      userId,
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
