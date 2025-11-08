'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

interface NotificationUser {
  id: string
  userID: string
  name: string | null
  image: string | null
}

export function NewPostNotification({ onRefresh }: { onRefresh?: () => void }) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<NotificationUser[]>([])
  const usersRef = useRef<Map<string, NotificationUser>>(new Map())

  // Extract current user ID to avoid TypeScript issues
  const currentUserID = session?.user?.userID ?? null

  // Listen for new posts from followed users on user's own channel
  usePusherChannel(
    currentUserID ? PUSHER_CHANNELS.user(currentUserID) : '',
    PUSHER_EVENTS.POST_CREATED,
    (data: { postId: string; userId: string; author: NotificationUser }) => {
      // Only show notification if it's not from the current user and author exists
      if (data.userId !== session?.user?.id && data.author) {
        addUser(data.author)
      }
    },
    !!currentUserID
  )

  // Listen for reposts from followed users on user's own channel
  usePusherChannel(
    currentUserID ? PUSHER_CHANNELS.user(currentUserID) : '',
    PUSHER_EVENTS.REPOST,
    (data: { postId: string; userId: string; author: NotificationUser }) => {
      // Only show notification if it's not from the current user and author exists
      if (data.userId !== session?.user?.id && data.author) {
        addUser(data.author)
      }
    },
    !!currentUserID
  )

  const addUser = (user: NotificationUser) => {
    // Don't add if user is already in the list
    if (usersRef.current.has(user.id)) {
      return
    }

    // Add user to map
    usersRef.current.set(user.id, user)

    // Update state with up to 3 users
    const userArray = Array.from(usersRef.current.values()).slice(0, 3)
    setUsers(userArray)
  }

  const handleClick = () => {
    // Refresh feed
    if (onRefresh) {
      onRefresh()
    }
    // Clear notification
    setUsers([])
    usersRef.current.clear()
  }

  if (users.length === 0) {
    return null
  }

  return (
    <div
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2">
        {/* Up arrow icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>

        {/* User avatars */}
        <div className="flex items-center -space-x-2">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-300 dark:bg-gray-700"
              style={{ zIndex: users.length - index }}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.userID}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {user.name?.[0]?.toUpperCase() || user.userID[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Posted text */}
        <span className="text-sm font-medium">posted</span>
      </div>
    </div>
  )
}

