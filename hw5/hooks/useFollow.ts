/**
 * Follow Hook
 * Custom hook for following/unfollowing users
 */

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { followUser, unfollowUser } from '@/lib/api/users'

/**
 * Hook for managing user follow state
 */
export function useFollow(userID: string, initialFollowing: boolean = false) {
  const { data: session } = useSession()
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const toggleFollow = async (): Promise<void> => {
    if (!session?.user?.id || loading) return

    setLoading(true)
    const previousFollowing = following

    // Optimistic update
    setFollowing(!following)

    try {
      if (previousFollowing) {
        await unfollowUser(userID)
      } else {
        await followUser(userID)
      }
      router.refresh() // Refresh to update follower count
    } catch (error: any) {
      // Revert on error
      setFollowing(previousFollowing)
      alert(error?.error || `Failed to ${previousFollowing ? 'unfollow' : 'follow'} user`)
    } finally {
      setLoading(false)
    }
  }

  return {
    following,
    toggleFollow,
    loading,
  }
}

