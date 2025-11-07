/**
 * User Posts Hook
 * Custom hook for fetching user posts
 */

import { useState, useEffect } from 'react'
import { getUserPosts } from '@/lib/api/users'
import type { PostWithDetails } from '@/types/entities/post'

/**
 * Hook for fetching user posts
 */
export function useUserPosts(userID: string) {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = async () => {
    setLoading(true)
    setError('')

    try {
      const { posts: userPosts } = await getUserPosts(userID)
      setPosts(userPosts || [])
    } catch (error: any) {
      setError(error?.error || 'Failed to load posts')
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [userID])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

