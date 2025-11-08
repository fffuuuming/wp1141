'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Avatar } from '@/components/ui'
import { FollowButton } from '@/components/FollowButton'

interface FollowersFollowingPageProps {
  userID: string
  userName: string
  initialTab: 'followers' | 'following'
}

interface UserItem {
  id: string
  userID: string
  name: string | null
  image: string | null
  bio: string | null
  isFollowing: boolean
}

export function FollowersFollowingPage({ userID, userName, initialTab }: FollowersFollowingPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const [followers, setFollowers] = useState<UserItem[]>([])
  const [following, setFollowing] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [userID, activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = activeTab === 'followers' 
        ? `/api/user/${userID}/followers`
        : `/api/user/${userID}/following`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        if (activeTab === 'followers') {
          setFollowers(data.followers || [])
        } else {
          setFollowing(data.following || [])
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to load data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('An error occurred while loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowChange = (targetUserID: string, isFollowing: boolean) => {
    // Update the local state
    const updateUser = (users: UserItem[]) =>
      users.map(user => 
        user.userID === targetUserID ? { ...user, isFollowing } : user
      )
    
    setFollowers(updateUser(followers))
    setFollowing(updateUser(following))
  }

  const currentUsers = activeTab === 'followers' ? followers : following
  const isOwnProfile = session?.user?.userID === userID

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{userName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{userID}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('followers')
                router.push(`/profile/${userID}/followers`)
              }}
              className={`flex-1 px-4 py-3 font-semibold text-sm relative transition-colors ${
                activeTab === 'followers'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Followers
              {activeTab === 'followers' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('following')
                router.push(`/profile/${userID}/following`)
              }}
              className={`flex-1 px-4 py-3 font-semibold text-sm relative transition-colors ${
                activeTab === 'following'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Following
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              Retry
            </button>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'followers' 
                ? 'This user doesn\'t have any followers yet'
                : 'This user isn\'t following anyone yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {currentUsers.map((user) => (
              <div
                key={user.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="px-4 py-4 flex items-start gap-3">
                  {/* Avatar */}
                  <Link href={`/profile/${user.userID}`} onClick={(e) => e.stopPropagation()}>
                    <Avatar 
                      user={{
                        id: user.id,
                        userID: user.userID,
                        name: user.name,
                        image: user.image,
                      }} 
                    />
                  </Link>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${user.userID}`}
                          className="block hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {user.name || 'User'}
                            </span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            @{user.userID}
                          </p>
                        </Link>
                        {user.bio && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      {/* Follow Button */}
                      {session?.user?.userID && session.user.userID !== user.userID && (
                        <div className="flex-shrink-0">
                          <FollowButton
                            userID={user.userID}
                            initialFollowing={user.isFollowing}
                            onFollowChange={(following) => handleFollowChange(user.userID, following)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

