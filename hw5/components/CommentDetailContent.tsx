'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PostCard } from './PostCard'
import { CommentAsPost } from './CommentAsPost'
import { CommentAsPostCard } from './CommentAsPostCard'
import { ExpandableCommentInput } from './ExpandableCommentInput'

interface CommentDetailContentProps {
  comment: {
    id: string
    content: string
    createdAt: string
    updatedAt: string
    postId: string | null
    author: {
      id: string
      userID: string
      name: string | null
      image: string | null
    }
    post?: {
      id: string
      content: string
      createdAt: string | Date
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
    } | null
    parent?: {
      id: string
      content: string
      createdAt?: string | Date
      author: {
        id: string
        userID: string
        name: string | null
        image: string | null
      }
    } | null
    _count: {
      likes: number
      replies: number
    }
    replies: any[]
  }
  backUrl: string
  backLabel: string
}

export function CommentDetailContent({ comment, backUrl, backLabel }: CommentDetailContentProps) {
  const router = useRouter()
  const [replies, setReplies] = useState(comment.replies || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Listen for comment creation events
    const handleCommentCreated = () => {
      fetchReplies()
    }
    window.addEventListener('commentCreated', handleCommentCreated)
    
    return () => {
      window.removeEventListener('commentCreated', handleCommentCreated)
    }
  }, [comment.id])

  const fetchReplies = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data.comment.replies || [])
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // If deleting the main comment, redirect back
        if (commentId === comment.id) {
          router.push(backUrl)
        } else {
          // Refresh replies
          fetchReplies()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('An error occurred while deleting comment')
    }
  }

  const handleReplyCreated = () => {
    fetchReplies()
  }

  const commentWithReplies = {
    ...comment,
    replies,
  }

  return (
    <>
      {/* Post (if available) */}
      {comment.post && (
        <div className="max-w-2xl mx-auto border-b border-gray-200 dark:border-gray-700">
          <PostCard
            post={{
              id: comment.post.id,
              content: comment.post.content,
              createdAt: typeof comment.post.createdAt === 'string' 
                ? comment.post.createdAt 
                : comment.post.createdAt.toISOString(),
              author: comment.post.author,
              _count: comment.post._count,
            }}
          />
        </div>
      )}

      {/* Parent Comment (if this is a reply) */}
      {comment.parent && (
        <div className="max-w-2xl mx-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            Replying to
          </div>
          <CommentAsPostCard
            comment={{
              ...comment.parent,
              createdAt: comment.parent.createdAt 
                ? (typeof comment.parent.createdAt === 'string' 
                    ? comment.parent.createdAt 
                    : comment.parent.createdAt.toISOString())
                : new Date().toISOString(),
              postId: comment.postId,
              _count: {
                likes: 0,
                replies: 0,
              },
            }}
            onDelete={handleDeleteComment}
            clickable={true}
          />
        </div>
      )}

      {/* Main Comment - displayed as a post */}
      <div className="max-w-2xl mx-auto">
        <CommentAsPostCard
          comment={comment}
          onDelete={handleDeleteComment}
          clickable={false}
        />

        {/* Reply Input */}
        {comment.postId && (
          <ExpandableCommentInput
            postId={comment.postId}
            parentId={comment.id}
            onCommentCreated={handleReplyCreated}
          />
        )}

        {/* Replies List - displayed as sub-posts */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading replies...</p>
          </div>
        ) : replies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No replies yet. Be the first to reply!</p>
          </div>
        ) : (
          <div>
            {replies.map((reply) => (
              <CommentAsPost
                key={reply.id}
                comment={reply}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

