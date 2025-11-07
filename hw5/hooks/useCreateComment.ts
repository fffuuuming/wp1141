/**
 * Create Comment Hook
 * Custom hook for creating comments/replies
 */

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { createPostReply, createCommentReply } from '@/lib/api'

/**
 * Hook for creating comments/replies
 */
export function useCreateComment(
  postId: string,
  parentId?: string | null,
  onSuccess?: () => void
) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (): Promise<boolean> => {
    if (!session?.user?.id) {
      setError('You must be logged in to comment')
      return false
    }

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return false
    }

    setLoading(true)
    setError('')

    try {
      if (parentId) {
        // Reply to a comment
        await createCommentReply(parentId, { content: content.trim() })
      } else {
        // Reply to a post
        await createPostReply(postId, { content: content.trim() })
      }

      // Clear content
      setContent('')

      // Trigger comment created event
      window.dispatchEvent(new Event('commentCreated'))

      if (onSuccess) {
        onSuccess()
      }

      return true
    } catch (error: any) {
      setError(error?.error || 'Failed to create comment')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    content,
    setContent,
    handleSubmit,
    loading,
    error,
    setError,
  }
}

