import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/posts-by-id/[userId]
 * Get user's posts and reposts by database user ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Fetch user's posts
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
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

    // Fetch user's reposts
    const reposts = await prisma.repost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
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

    return NextResponse.json({
      content: allContent,
    })
  } catch (error: any) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

