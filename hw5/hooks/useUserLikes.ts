/**
 * User Likes Hook
 * Custom hook for fetching user liked posts
 */

import { useState, useEffect } from 'react'
import { getUserLikes } from '@/lib/api/users'
import type { PostWithDetails } from '@/types/entities/post'

/**
 * Hook for fetching user liked posts
 */
export function useUserLikes(userID: string) {
  const [likedPosts, setLikedPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLikes = async () => {
    setLoading(true)
    setError('')

    try {
      const { posts: liked } = await getUserLikes(userID)
      setLikedPosts(liked || [])
    } catch (error: any) {
      setError(error?.error || 'Failed to load liked posts')
      console.error('Error fetching user likes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLikes()
  }, [userID])

  return {
    likedPosts,
    loading,
    error,
    refetch: fetchLikes,
  }
}

