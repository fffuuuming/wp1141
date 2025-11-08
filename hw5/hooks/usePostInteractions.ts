/**
 * Post Interaction Hooks
 * Custom hooks for post interactions (like, repost, delete)
 */

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { likePost, isPostLiked, repostPost, isPostReposted, deletePost } from '@/lib/api/posts'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

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

  // Update count when initialCount changes (but not if user just took action)
  useEffect(() => {
    if (!userActionRef.current) {
      setLikeCount(initialCount)
    }
  }, [initialCount])

  // Check initial like status
  useEffect(() => {
    if (session?.user?.id && !hasCheckedRef.current && !userActionRef.current) {
      checkLikeStatus()
      hasCheckedRef.current = true
    }
  }, [session, postId])

  // Listen for real-time like updates (only if not from current user's action)
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.LIKE,
    (data: { postId: string; userId: string; count: number; liked: boolean }) => {
      // Only update if it's not from the current user (to avoid double updates)
      if (data.userId !== session?.user?.id && !userActionRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[usePostLike] Received like event for post ${postId}, updating count to ${data.count}`)
        }
        setLikeCount(data.count)
      }
    },
    !!session?.user?.id
  )

  // Listen for real-time unlike updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.UNLIKE,
    (data: { postId: string; userId: string; count: number; liked: boolean }) => {
      // Only update if it's not from the current user
      if (data.userId !== session?.user?.id && !userActionRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[usePostLike] Received unlike event for post ${postId}, updating count to ${data.count}`)
        }
        setLikeCount(data.count)
      }
    },
    !!session?.user?.id
  )

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
      // Reset user action flag after successful API call
      userActionRef.current = false
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
  const userActionRef = useRef(false)

  // Update count when initialCount changes (but not if user just took action)
  useEffect(() => {
    if (!userActionRef.current && !loading) {
      setRepostCount(initialCount)
    }
  }, [initialCount])

  // Check initial repost status
  useEffect(() => {
    if (session?.user?.id && !hasCheckedRef.current) {
      checkRepostStatus()
      hasCheckedRef.current = true
    }
  }, [session, postId])

  // Listen for real-time repost updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.REPOST,
    (data: { postId: string; userId: string; count: number; reposted: boolean }) => {
      // Only update if it's not from the current user
      if (data.userId !== session?.user?.id && !loading && !userActionRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[usePostRepost] Received repost event for post ${postId}, updating count to ${data.count}`)
        }
        setRepostCount(data.count)
      }
    },
    !!session?.user?.id
  )

  // Listen for real-time unrepost updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.UNREPOST,
    (data: { postId: string; userId: string; count: number; reposted: boolean }) => {
      // Only update if it's not from the current user
      if (data.userId !== session?.user?.id && !loading && !userActionRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[usePostRepost] Received unrepost event for post ${postId}, updating count to ${data.count}`)
        }
        setRepostCount(data.count)
      }
    },
    !!session?.user?.id
  )

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

    // Mark that user has taken action
    userActionRef.current = true

    // Optimistic update
    setReposted(!reposted)
    setRepostCount(previousReposted ? previousCount - 1 : previousCount + 1)

    try {
      const { reposted: isReposted, count } = await repostPost(postId)
      setReposted(isReposted)
      setRepostCount(count)
      // Reset user action flag after successful API call
      userActionRef.current = false
    } catch (error: any) {
      // Revert on error
      setReposted(previousReposted)
      setRepostCount(previousCount)
      userActionRef.current = false
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

