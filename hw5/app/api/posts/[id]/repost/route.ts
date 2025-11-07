import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/posts/[id]/repost
 * Toggle repost on a post
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

    // Check if user already reposted this post
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    })

    if (existingRepost) {
      // Unrepost: delete the repost
      await prisma.repost.delete({
        where: {
          id: existingRepost.id,
        },
      })

      // Get updated count
      const count = await prisma.repost.count({
        where: { postId },
      })

      return NextResponse.json({ reposted: false, count })
    } else {
      // Repost: create the repost
      await prisma.repost.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      })

      // Get updated count
      const count = await prisma.repost.count({
        where: { postId },
      })

      return NextResponse.json({ reposted: true, count })
    }
  } catch (error: any) {
    console.error('Error toggling repost:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/posts/[id]/reposted
 * Check if current user reposted the post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ reposted: false })
    }

    const { id: postId } = await params

    const repost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    })

    return NextResponse.json({ reposted: !!repost })
  } catch (error: any) {
    console.error('Error checking repost status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

