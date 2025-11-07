import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/[userID]/posts
 * Get user's posts and reposts (public to all)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params

    // Find user by userID
    const user = await prisma.user.findUnique({
      where: { userID },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's top-level posts (not replies)
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        parentId: null, // Only top-level posts
      },
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
            replies: true,
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
      where: { userId: user.id },
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
                replies: true,
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

