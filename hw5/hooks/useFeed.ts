/**
 * Feed Hook
 * Custom hook for fetching feed data
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getFeed } from '@/lib/api/feed'
import type { PostWithDetails } from '@/types/entities/post'

type FilterType = 'all' | 'following'

/**
 * Hook for fetching and managing feed posts
 */
export function useFeed(filter: FilterType = 'all') {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { posts: feedPosts } = await getFeed(filter)
      setPosts(feedPosts || [])
    } catch (error: any) {
      setError(error?.error || 'Failed to load posts')
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filter, session])

  // Listen for post creation events
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts()
    }

    window.addEventListener('postCreated', handlePostCreated)
    return () => window.removeEventListener('postCreated', handlePostCreated)
  }, [filter, session])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

