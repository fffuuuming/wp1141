import { NextRequest } from 'next/server'
import { withErrorHandling } from '@/lib/api/handlers/wrapper'
import { validateParams } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { userIdSchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * GET /api/user/[userID]/posts
 * Get user's posts and reposts (public to all)
 */
export const GET = withErrorHandling(async (request, { params }) => {
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

  // Fetch user's top-level posts (not replies)
  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      parentId: null, // Only top-level posts
    },
    include: postWithDetailsInclude,
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Fetch user's reposts
  const reposts = await prisma.repost.findMany({
    where: { userId: user.id },
    include: {
      post: {
        include: postWithDetailsInclude,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Combine posts and reposts, sort by date
  const allContent = [
    ...posts.map((post) => ({
      type: 'post' as const,
      id: post.id,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      _count: post._count,
    })),
    ...reposts.map((repost) => ({
      type: 'repost' as const,
      id: repost.id,
      repostedAt: repost.createdAt.toISOString(),
      post: {
        id: repost.post.id,
        content: repost.post.content,
        createdAt: repost.post.createdAt.toISOString(),
        author: repost.post.author,
        _count: repost.post._count,
      },
    })),
  ].sort((a, b) => {
    const dateA = a.type === 'post' ? a.createdAt : a.repostedAt
    const dateB = b.type === 'post' ? b.createdAt : b.repostedAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return successResponse({
    content: allContent,
  })
})
