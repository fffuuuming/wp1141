import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/posts/[id]/like
 * Toggle like on a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: postId } = await params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    })

    if (existingLike) {
      // Unlike: delete the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      // Get updated count
      const count = await prisma.like.count({
        where: { postId },
      })

      return NextResponse.json({ liked: false, count })
    } else {
      // Like: create the like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      })

      // Get updated count
      const count = await prisma.like.count({
        where: { postId },
      })

      return NextResponse.json({ liked: true, count })
    }
  } catch (error: any) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/posts/[id]/liked
 * Check if current user liked the post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ liked: false })
    }

    const { id: postId } = await params

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    })

    return NextResponse.json({ liked: !!like })
  } catch (error: any) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

