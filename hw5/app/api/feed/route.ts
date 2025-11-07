import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/feed?filter=all|following
 * Get home feed posts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'

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
        comments: number
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
          },
          include: {
            author: {
              select: {
                id: true,
                userID: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                reposts: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      }
    } else {
      // Get all posts
      posts = await prisma.post.findMany({
        include: {
          author: {
            select: {
              id: true,
              userID: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              reposts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

