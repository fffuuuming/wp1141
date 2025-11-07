/**
 * Post Interaction Hooks
 * Custom hooks for post interactions (like, repost, delete)
 */

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { likePost, isPostLiked, repostPost, isPostReposted, deletePost } from '@/lib/api/posts'

/**
 * Hook for managing post likes
 */
export function usePostLike(postId: string, initialCount: number) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const hasCheckedRef = useRef(false)
  const userActionRef = useRef(false)

  // Check initial like status
  useEffect(() => {
    if (session?.user?.id && !hasCheckedRef.current && !userActionRef.current) {
      checkLikeStatus()
      hasCheckedRef.current = true
    }
  }, [session, postId])

  const checkLikeStatus = async () => {
    if (userActionRef.current) return

    try {
      const { liked: isLiked } = await isPostLiked(postId)
      setLiked(isLiked)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const toggleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!session?.user?.id || loading) return

    const previousLiked = liked
    const previousCount = likeCount

    // Mark that user has taken action
    userActionRef.current = true

    // Optimistic update
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(newLiked ? previousCount + 1 : previousCount - 1)

    try {
      const { liked: isLiked, count } = await likePost(postId)
      setLiked(isLiked)
      setLikeCount(count)
    } catch (error: any) {
      // Revert on error
      setLiked(previousLiked)
      setLikeCount(previousCount)
      userActionRef.current = false
      alert(error?.error || 'Failed to like post')
    }
  }

  return {
    liked,
    likeCount,
    toggleLike,
    loading,
  }
}

/**
 * Hook for managing post reposts
 */
export function usePostRepost(postId: string, initialCount: number) {
  const { data: session } = useSession()
  const [reposted, setReposted] = useState(false)
  const [repostCount, setRepostCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const hasCheckedRef = useRef(false)

  // Check initial repost status
  useEffect(() => {
    if (session?.user?.id && !hasCheckedRef.current) {
      checkRepostStatus()
      hasCheckedRef.current = true
    }
  }, [session, postId])

  const checkRepostStatus = async () => {
    try {
      const { reposted: isReposted } = await isPostReposted(postId)
      setReposted(isReposted)
    } catch (error) {
      console.error('Error checking repost status:', error)
    }
  }

  const toggleRepost = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!session?.user?.id || loading) return

    setLoading(true)
    const previousReposted = reposted
    const previousCount = repostCount

    // Optimistic update
    setReposted(!reposted)
    setRepostCount(previousReposted ? previousCount - 1 : previousCount + 1)

    try {
      const { reposted: isReposted, count } = await repostPost(postId)
      setReposted(isReposted)
      setRepostCount(count)
    } catch (error: any) {
      // Revert on error
      setReposted(previousReposted)
      setRepostCount(previousCount)
      alert(error?.error || 'Failed to repost')
    } finally {
      setLoading(false)
    }
  }

  return {
    reposted,
    repostCount,
    toggleRepost,
    loading,
  }
}

/**
 * Hook for deleting posts
 */
export function usePostDelete(postId: string) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const deletePostHandler = async (): Promise<boolean> => {
    if (!session?.user?.id || loading) return false

    if (!confirm('Are you sure you want to delete this post?')) {
      return false
    }

    setLoading(true)
    try {
      await deletePost(postId)
      return true
    } catch (error: any) {
      alert(error?.error || 'Failed to delete post')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deletePost: deletePostHandler,
    loading,
  }
}

