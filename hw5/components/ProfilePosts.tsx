'use client'

import { useEffect, useState } from 'react'

interface ProfilePostsProps {
  userID: string
  isOwnProfile: boolean
}

interface PostItem {
  type: 'post' | 'repost'
  id: string
  content?: string
  createdAt?: string
  repostedAt?: string
  author?: {
    userID: string
    name: string | null
    image: string | null
  }
  post?: {
    id: string
    content: string
    createdAt: string
    author: {
      userID: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      comments: number
      reposts: number
    }
  }
  _count?: {
    likes: number
    comments: number
    reposts: number
  }
}

export function ProfilePosts({ userID, isOwnProfile }: ProfilePostsProps) {
  const [content, setContent] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // userID here is actually the database user.id
        // We need to find the userID string to call the API
        // For now, we'll use a different approach - pass userID string from parent
        // But since we're getting the database ID, let's create a helper API
        
        // Try to get user by ID to find userID string
        const response = await fetch(`/api/user/posts-by-id/${userID}`)
        if (response.ok) {
          const data = await response.json()
          setContent(data.content || [])
        } else {
          // Fallback: if API doesn't exist, show empty
          setContent([])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        setContent([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [userID])

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No posts yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Posts and reposts will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="space-y-0">
        {content.map((item) => (
          <div
            key={item.id}
            className="border-b border-gray-200 dark:border-gray-700 pb-4 pt-4 first:pt-0 last:border-b-0"
          >
            {item.type === 'repost' && item.post ? (
              // Repost
              <div>
                <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.226 2.226V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.226-2.226c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.226 2.226c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.768.293 1.06 0l2.226-2.226V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" />
                  </svg>
                  <span>You reposted</span>
                </div>
                <div className="flex gap-3">
                  {item.post.author.image ? (
                    <img
                      src={item.post.author.image}
                      alt={item.post.author.name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {item.post.author.name?.[0]?.toUpperCase() || item.post.author.userID[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.post.author.name || 'User'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        @{item.post.author.userID}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">·</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(item.post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-2">
                      {item.post.content}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>{item.post._count.likes} likes</span>
                      <span>{item.post._count.comments} comments</span>
                      <span>{item.post._count.reposts} reposts</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Regular Post
              <div className="flex gap-3">
                {item.author?.image ? (
                  <img
                    src={item.author.image}
                    alt={item.author.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {item.author?.name?.[0]?.toUpperCase() || item.author?.userID?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.author?.name || 'User'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      @{item.author?.userID}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-2">
                    {item.content}
                  </p>
                  {item._count && (
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>{item._count.likes} likes</span>
                      <span>{item._count.comments} comments</span>
                      <span>{item._count.reposts} reposts</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
