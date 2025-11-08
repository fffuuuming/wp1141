/**
 * Post Reply Count Hook
 * Custom hook for managing post reply counts with real-time updates
 */

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

/**
 * Hook for managing post reply counts with real-time updates
 */
export function usePostReplyCount(postId: string, initialCount: number) {
  const { data: session } = useSession()
  const [replyCount, setReplyCount] = useState(initialCount)
  const userActionRef = useRef(false)

  // Update count when initialCount changes
  useEffect(() => {
    if (!userActionRef.current) {
      setReplyCount(initialCount)
    }
  }, [initialCount])

  // Listen for real-time comment created events
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.COMMENT_CREATED,
    (data: { postId: string; userId: string; count: number }) => {
      // Only update if it's not from the current user (to avoid double updates)
      if (data.userId !== session?.user?.id && !userActionRef.current) {
        setReplyCount(data.count)
      }
    },
    !!session?.user?.id
  )

  // Listen for real-time comment deleted events
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.COMMENT_DELETED,
    (data: { postId: string; userId: string; count: number }) => {
      // Only update if it's not from the current user
      if (data.userId !== session?.user?.id && !userActionRef.current) {
        setReplyCount(data.count)
      }
    },
    !!session?.user?.id
  )

  return replyCount
}

