import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/posts/[id]/comments
 * Create a reply (sub-post) on a post
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
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      )
    }

    // Check if parent post exists
    const parentPost = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!parentPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Create reply (sub-post)
    const reply = await prisma.post.create({
      data: {
        authorId: session.user.id,
        parentId: postId,
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

    // Get updated reply count
    const replyCount = await prisma.post.count({
      where: { parentId: postId },
    })

    return NextResponse.json({ post: reply, count: replyCount })
  } catch (error: any) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Recursively fetch replies for a post
 */
async function fetchPostReplies(parentId: string): Promise<any[]> {
  const replies = await prisma.post.findMany({
    where: {
      parentId: parentId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
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
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Recursively fetch nested replies
  const repliesWithNested = await Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await fetchPostReplies(reply.id)
      return {
        ...reply,
        replies: nestedReplies,
      }
    })
  )

  return repliesWithNested
}

/**
 * GET /api/posts/[id]/comments
 * Get replies (sub-posts) for a post (with nested replies)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // Get direct replies (sub-posts) to this post
    const replies = await prisma.post.findMany({
      where: {
        parentId: postId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch nested replies for each reply
    const repliesWithNested = await Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await fetchPostReplies(reply.id)
        return {
          ...reply,
          replies: nestedReplies,
        }
      })
    )

    return NextResponse.json({ comments: repliesWithNested })
  } catch (error: any) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

