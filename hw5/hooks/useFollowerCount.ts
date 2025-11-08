/**
 * Follower Count Hook
 * Custom hook for managing follower counts with real-time updates
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

/**
 * Hook for managing follower counts with real-time updates
 */
export function useFollowerCount(userID: string, initialFollowerCount: number, initialFollowingCount: number) {
  const { data: session } = useSession()
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [followingCount, setFollowingCount] = useState(initialFollowingCount)

  // Update counts when initial values change
  useEffect(() => {
    setFollowerCount(initialFollowerCount)
    setFollowingCount(initialFollowingCount)
  }, [initialFollowerCount, initialFollowingCount])

  // Listen for real-time follow events
  usePusherChannel(
    PUSHER_CHANNELS.user(userID),
    PUSHER_EVENTS.FOLLOW,
    (data: { userID: string; followerId: string; followerCount?: number; followingCount?: number }) => {
      // Update follower count if this is the target user's profile
      if (data.followerCount !== undefined && data.followerId !== session?.user?.id) {
        setFollowerCount(data.followerCount)
      }
      // Update following count if this is the current user's profile and they followed someone
      if (data.followingCount !== undefined && data.followerId === session?.user?.id) {
        setFollowingCount(data.followingCount)
      }
    },
    !!session?.user?.id
  )

  // Listen for real-time unfollow events
  usePusherChannel(
    PUSHER_CHANNELS.user(userID),
    PUSHER_EVENTS.UNFOLLOW,
    (data: { userID: string; followerId: string; followerCount?: number; followingCount?: number }) => {
      // Update follower count if this is the target user's profile
      if (data.followerCount !== undefined && data.followerId !== session?.user?.id) {
        setFollowerCount(data.followerCount)
      }
      // Update following count if this is the current user's profile and they unfollowed someone
      if (data.followingCount !== undefined && data.followerId === session?.user?.id) {
        setFollowingCount(data.followingCount)
      }
    },
    !!session?.user?.id
  )

  return {
    followerCount,
    followingCount,
  }
}

