'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  userID: string
  initialFollowing: boolean
  onFollowChange?: (following: boolean) => void
}

export function FollowButton({ userID, initialFollowing, onFollowChange }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFollow = async () => {
    setLoading(true)
    try {
      if (following) {
        // Unfollow
        const response = await fetch(`/api/user/${userID}/follow`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setFollowing(false)
          onFollowChange?.(false)
          router.refresh() // Refresh to update follower count
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to unfollow user')
        }
      } else {
        // Follow
        const response = await fetch(`/api/user/${userID}/follow`, {
          method: 'POST',
        })

        if (response.ok) {
          setFollowing(true)
          onFollowChange?.(true)
          router.refresh() // Refresh to update follower count
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to follow user')
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      aria-label={loading ? (following ? 'Unfollowing...' : 'Following...') : (following ? `Unfollow @${userID}` : `Follow @${userID}`)}
      aria-pressed={following}
      className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
        following
          ? 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {following ? 'Unfollowing...' : 'Following...'}
        </span>
      ) : following ? (
        'Following'
      ) : (
        'Follow'
      )}
    </button>
  )
}

