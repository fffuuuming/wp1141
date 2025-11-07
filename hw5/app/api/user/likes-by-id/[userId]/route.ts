import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * GET /api/user/likes-by-id/[userId]
 * Get posts that the user has liked by database user ID (only accessible by the user themselves)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow users to see their own likes
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own likes' },
        { status: 403 }
      )
    }

    // Fetch liked posts
    const likes = await prisma.like.findMany({
      where: {
        userId,
      },
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

    return NextResponse.json({
      likedPosts: likes.map((like) => ({
        id: like.id,
        post: like.post,
        createdAt: like.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching liked posts:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

