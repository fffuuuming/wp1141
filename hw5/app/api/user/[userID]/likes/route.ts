import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * GET /api/user/[userID]/likes
 * Get posts that the user has liked (only accessible by the user themselves)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Only allow users to see their own likes
    if (user.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own likes' },
        { status: 403 }
      )
    }

    // Fetch liked posts
    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
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

