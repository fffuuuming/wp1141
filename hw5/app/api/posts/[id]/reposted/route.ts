import { NextRequest } from 'next/server'
import { withOptionalAuth } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { postIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/posts/[id]/reposted
 * Check if the current user has reposted this post
 */
export const GET = withOptionalAuth(async (request, { params, session }) => {
  const { id: postId } = await validateParams(await params, postIdSchema)

  if (!session) {
    return successResponse({ reposted: false })
  }

  const repost = await prisma.repost.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: postId,
      },
    },
  })

  return successResponse({ reposted: !!repost })
})

