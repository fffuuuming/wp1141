'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar } from './ui/Avatar'
import { FollowButton } from './FollowButton'
import { searchUsers, getRecommendations } from '@/lib/api/users'
import type { UsersResponse } from '@/types/api/responses'

interface SearchUser {
  id: string
  userID: string
  name: string | null
  image: string | null
  stats: {
    posts: number
    following: number
    followers: number
  }
  isFollowing: boolean
  isOwnProfile: boolean
}

export function RightSidebar() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recommendations, setRecommendations] = useState<SearchUser[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const router = useRouter()
  
  // Use stable values for current user to avoid dependency array size changes
  const currentUserId = session?.user?.id ?? null
  const currentUserID = session?.user?.userID ?? null

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchUsers(searchQuery, 5) // Limit to 5 results for sidebar
        // The API returns { users: [...] } or { data: { users: [...] } }
        const users = (response as any).users || (response as any).data?.users || []
        // Filter out current user from search results
        const filteredUsers = users.filter((user: SearchUser) => 
          user.id !== currentUserId && user.userID !== currentUserID
        )
        setSearchResults(filteredUsers)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentUserId, currentUserID])

  // Load recommendations on mount
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoadingRecommendations(true)
        const response = await getRecommendations()
        // The API returns { users: [...] } or { data: { users: [...] } }
        const users = (response as any).users || (response as any).data?.users || []
        setRecommendations(users)
      } catch (error) {
        console.error('Error loading recommendations:', error)
        setRecommendations([])
      } finally {
        setIsLoadingRecommendations(false)
      }
    }

    loadRecommendations()
  }, [])

  const handleFollowChange = useCallback((userID: string, following: boolean) => {
    // Update recommendations
    setRecommendations(prev =>
      prev.map(user =>
        user.userID === userID ? { ...user, isFollowing: following } : user
      )
    )
    // Update search results
    setSearchResults(prev =>
      prev.map(user =>
        user.userID === userID ? { ...user, isFollowing: following } : user
      )
    )
    router.refresh()
  }, [router])

  return (
    <aside className="hidden xl:block fixed right-0 top-0 h-screen w-[28vw] border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 flex justify-end">
      <div className="p-4 w-full max-w-[320px] space-y-6 overflow-y-auto">
        {/* Search Bar */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mt-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-[400px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.userID}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Avatar
                        user={{
                          id: user.id,
                          userID: user.userID,
                          name: user.name,
                          image: user.image,
                        }}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.name || user.userID}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{user.userID}
                        </p>
                      </div>
                      {!user.isOwnProfile && (
                        <div onClick={(e) => e.preventDefault()} className="flex-shrink-0">
                          <button
                            onClick={async () => {
                              const response = user.isFollowing
                                ? await fetch(`/api/user/${user.userID}/follow`, { method: 'DELETE' })
                                : await fetch(`/api/user/${user.userID}/follow`, { method: 'POST' })
                              
                              if (response.ok) {
                                handleFollowChange(user.userID, !user.isFollowing)
                              }
                            }}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                              user.isFollowing
                                ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                            }`}
                          >
                            {user.isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No users found
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Who to Follow */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Who to follow
          </h2>
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3"
                >
                  <Link href={`/profile/${user.userID}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      user={{
                        id: user.id,
                        userID: user.userID,
                        name: user.name,
                        image: user.image,
                      }}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name || user.userID}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{user.userID}
                      </p>
                    </div>
                  </Link>
                  <FollowButton
                    userID={user.userID}
                    initialFollowing={user.isFollowing}
                    onFollowChange={(following) => handleFollowChange(user.userID, following)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No recommendations available
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
