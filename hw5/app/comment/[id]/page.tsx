import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CommentDetailContent } from '@/components/CommentDetailContent'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Find the root post (top-level post) by traversing up the parent chain
 */
async function findRootPost(postId: string): Promise<string | null> {
  let currentId = postId
  let depth = 0
  const maxDepth = 100 // Prevent infinite loops

  while (depth < maxDepth) {
    const post = await prisma.post.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })

    if (!post) return null
    if (!post.parentId) return currentId // Found root post

    currentId = post.parentId
    depth++
  }

  return null // Max depth reached
}

/**
 * Recursively fetch replies for a comment (which is a Post with parentId)
 */
async function fetchCommentReplies(parentId: string): Promise<any[]> {
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
      const nestedReplies = await fetchCommentReplies(reply.id)
      return {
        ...reply,
        replies: nestedReplies,
      }
    })
  )

  return repliesWithNested
}

interface CommentPageProps {
  params: Promise<{ id: string }>
}

export default async function CommentPage({ params }: CommentPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const comment = await prisma.post.findUnique({
    where: { id },
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
      parent: {
        select: {
          id: true,
          content: true,
          createdAt: true,
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
              reposts: true,
            },
          },
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
  })

  if (!comment) {
    redirect('/')
  }

  // Find the root post (original post this comment is on)
  const rootPostId = await findRootPost(comment.id)
  let rootPost = null
  if (rootPostId) {
    rootPost = await prisma.post.findUnique({
      where: { id: rootPostId },
      select: {
        id: true,
        content: true,
        createdAt: true,
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
            reposts: true,
          },
        },
      },
    })
  }

  // Fetch nested replies
  const replies = await fetchCommentReplies(comment.id)

  const commentWithReplies = {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt?.toISOString(),
    postId: rootPostId, // Original post ID
    author: comment.author,
    post: rootPost ? {
      ...rootPost,
      createdAt: rootPost.createdAt.toISOString(),
    } : null,
    parent: comment.parent ? {
      ...comment.parent,
      createdAt: comment.parent.createdAt.toISOString(),
    } : null,
    _count: comment._count,
    replies,
  }

  // Determine back navigation URL
  // If comment has a parent, go back to parent comment
  // Otherwise, if it's a top-level comment, go back to the post
  // Otherwise, go to home
  let backUrl = '/'
  let backLabel = 'Home'
  
  if (comment.parent) {
    backUrl = `/comment/${comment.parent.id}`
    backLabel = 'Post'
  } else if (rootPostId) {
    backUrl = `/post/${rootPostId}`
    backLabel = 'Post'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{backLabel}</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
        </div>
      </div>

      {/* Comment Detail Content */}
      <CommentDetailContent
        comment={commentWithReplies}
        backUrl={backUrl}
        backLabel={backLabel}
      />
    </div>
  )
}

