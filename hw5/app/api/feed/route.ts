import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateQuery } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { feedQuerySchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'

/**
 * GET /api/feed?filter=all|following
 * Get home feed posts
 */
export const GET = withAuth(async (request, { session }) => {
  const { filter } = validateQuery(request, feedQuerySchema)

  let posts: Array<{
    id: string
    content: string
    createdAt: Date
    author: {
      id: string
      userID: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      replies: number
      reposts: number
    }
  }> = []

  if (filter === 'following') {
    // Get posts from users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    })

    const followingIds = following.map(f => f.followingId)

    if (followingIds.length === 0) {
      // User doesn't follow anyone, return empty array
      posts = []
    } else {
      posts = await prisma.post.findMany({
        where: {
          authorId: {
            in: followingIds,
          },
          parentId: null, // Only top-level posts
        },
        include: postWithDetailsInclude,
        orderBy: {
          createdAt: 'desc',
        },
      })
    }
  } else {
    // Get all top-level posts (no parent)
    posts = await prisma.post.findMany({
      where: {
        parentId: null, // Only top-level posts
      },
      include: postWithDetailsInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  return successResponse({ posts })
})

