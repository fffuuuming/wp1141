import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/comments/[id]/replies
 * Create a reply to a comment
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

    const { id: parentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        postId: true,
      },
    })

    if (!parentComment) {
      return NextResponse.json(
        { error: 'Parent comment not found' },
        { status: 404 }
      )
    }

    // Create reply
    const reply = await prisma.comment.create({
      data: {
        authorId: session.user.id,
        postId: parentComment.postId, // Keep reference to original post
        parentId: parentId,
        content: content.trim(),
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
            replies: true,
          },
        },
      },
    })

    return NextResponse.json({ comment: reply })
  } catch (error: any) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

