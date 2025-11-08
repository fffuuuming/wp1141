'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PostCard } from './PostCard'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

interface Comment {
  id: string
  content: string
  createdAt: string
  parentId: string | null
  author: {
    id: string
    userID: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    replies: number
  }
  replies?: Comment[]
}

interface CommentsListProps {
  postId: string
  onCommentClick?: (commentId: string) => void
}

export function CommentsList({ postId, onCommentClick }: CommentsListProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
    
    // Listen for comment creation events (legacy window events)
    const handleCommentCreated = () => {
      fetchComments()
    }
    window.addEventListener('commentCreated', handleCommentCreated)
    
    return () => {
      window.removeEventListener('commentCreated', handleCommentCreated)
    }
  }, [postId])

  // Listen for real-time comment created events via Pusher
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.COMMENT_CREATED,
    (data: { postId: string; commentId: string; userId: string; count: number }) => {
      // Only refresh if it's not from the current user (to avoid double updates)
      if (data.userId !== session?.user?.id) {
        fetchComments()
      }
    },
    !!session?.user?.id
  )

  // Listen for real-time comment deleted events via Pusher
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.COMMENT_DELETED,
    (data: { postId: string; commentId: string; userId: string; count: number }) => {
      // Only refresh if it's not from the current user
      if (data.userId !== session?.user?.id) {
        fetchComments()
      }
    },
    !!session?.user?.id
  )

  const fetchComments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to load comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('An error occurred while loading comments')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove comment from list
        setComments(comments.filter(c => c.id !== commentId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('An error occurred while deleting comment')
    }
  }

  const handleCardClick = (commentId: string) => {
    if (onCommentClick) {
      onCommentClick(commentId)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Comments List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchComments}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No replies yet. Be the first to reply!</p>
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <div
              key={comment.id}
              onClick={() => handleCardClick(comment.id)}
              className="cursor-pointer"
            >
              <PostCard
                post={{
                  id: comment.id,
                  content: comment.content,
                  createdAt: comment.createdAt,
                  author: comment.author,
                  _count: {
                    likes: comment._count.likes,
                    replies: comment._count.replies,
                    reposts: 0, // Replies don't have reposts
                  },
                }}
              onDelete={handleDeleteComment}
                clickable={true}
                variant="comment"
            />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
