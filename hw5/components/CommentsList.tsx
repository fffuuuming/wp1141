'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CommentInput } from './CommentInput'
import { CommentCard } from './CommentCard'

interface Comment {
  id: string
  content: string
  createdAt: string
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
}

interface CommentsListProps {
  postId: string
}

export function CommentsList({ postId }: CommentsListProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [postId])

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

  const handleCommentCreated = () => {
    fetchComments()
    // Trigger event to update comment count on post cards
    window.dispatchEvent(new Event('commentCreated'))
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

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Comment Input */}
      {session && <CommentInput postId={postId} onCommentCreated={handleCommentCreated} />}

      {/* Comments Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Comments
        </h2>
      </div>

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
          <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

