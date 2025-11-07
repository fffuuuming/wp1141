/**
 * Create Post Hook
 * Custom hook for creating posts
 */

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/lib/api/posts'
import { calculateCharacterCount } from '@/lib/postUtils'

import { POST_CONTENT } from '@/lib/constants/validation'

const MAX_CHARS = POST_CONTENT.MAX_CHARS

/**
 * Hook for creating posts
 */
export function useCreatePost(onSuccess?: () => void) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const charCount = calculateCharacterCount(content)
  const remainingChars = MAX_CHARS - charCount
  const isOverLimit = charCount > MAX_CHARS

  const handlePost = async (): Promise<boolean> => {
    if (!session?.user?.id) {
      setError('You must be logged in to post')
      return false
    }

    if (isOverLimit) {
      setError(`Post exceeds ${MAX_CHARS} character limit`)
      return false
    }

    if (!content.trim()) {
      setError('Post content cannot be empty')
      return false
    }

    setLoading(true)
    setError('')

    try {
      await createPost({ content: content.trim() })
      
      // Clear content
      setContent('')
      
      // Refresh feed
      if (onSuccess) {
        onSuccess()
      }
      router.refresh()
      window.dispatchEvent(new Event('postCreated'))
      
      return true
    } catch (error: any) {
      setError(error?.error || 'Failed to create post')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    content,
    setContent,
    handlePost,
    loading,
    error,
    setError,
    charCount,
    remainingChars,
    isOverLimit,
  }
}

