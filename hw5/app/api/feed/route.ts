import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/handlers/wrapper'
import { validateQuery } from '@/lib/api/middleware/validate'
import { successResponse } from '@/lib/api/helpers/response'
import { feedQuerySchema } from '@/lib/validation/schemas/params.schema'
import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'

/**
 * GET /api/feed?filter=all|following
 * Get home feed posts and reposts
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

  let reposts: Array<{
    id: string
    createdAt: Date
    user: {
      id: string
      userID: string
      name: string | null
      image: string | null
    }
    post: {
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
      // User doesn't follow anyone, return empty arrays
      posts = []
      reposts = []
    } else {
      // Get posts from followed users
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

      // Get reposts from followed users
      reposts = await prisma.repost.findMany({
        where: {
          userId: {
            in: followingIds,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              userID: true,
              name: true,
              image: true,
            },
          },
          post: {
            include: postWithDetailsInclude,
          },
        },
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

    // Get all reposts
    reposts = await prisma.repost.findMany({
      include: {
        user: {
          select: {
            id: true,
            userID: true,
            name: true,
            image: true,
          },
        },
        post: {
          include: postWithDetailsInclude,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // Combine posts and reposts, sort by date (repost date for reposts, post date for posts)
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
      repostedBy: repost.user,
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

  return successResponse({ posts: allContent })
})

