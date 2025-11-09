'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PostCard } from './PostCard'
import { InlinePost } from './InlinePost'
import { NewPostNotification } from './NewPostNotification'
import { useHomeFilter } from './HomeHeader'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'
import type { PostWithDetails } from '@/types/entities/post'

interface FeedItem {
  type: 'post' | 'repost'
  id: string
  content?: string
  createdAt?: string
  repostedAt?: string
  repostedBy?: {
    id: string
    userID: string
    name: string | null
    image: string | null
  }
  author?: {
    id: string
    userID: string
    name: string | null
    image: string | null
  }
  post?: {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    userID: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
      replies: number
      reposts: number
    }
  }
  _count?: {
    likes: number
    replies: number
    reposts: number
  }
}

export function HomeFeed() {
  const { data: session } = useSession()
  const router = useRouter()
  const { filter } = useHomeFilter()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      fetchPosts()
    }
  }, [filter, session])

  // Refresh feed when a new post is created
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts()
    }

    window.addEventListener('postCreated', handlePostCreated)
    return () => window.removeEventListener('postCreated', handlePostCreated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for unrepost events to remove reposts from feed
  usePusherChannel(
    PUSHER_CHANNELS.feed,
    PUSHER_EVENTS.UNREPOST,
    (data: { postId: string; userId: string; repostId: string }) => {
      // Only remove if it's the current user's repost
      if (data.userId === session?.user?.id) {
        setFeedItems((prevItems) => 
          prevItems.filter((item) => {
            // Remove the repost item if it matches the repostId
            if (item.type === 'repost' && item.id === data.repostId) {
              return false
            }
            return true
          })
        )
      }
    },
    !!session?.user?.id
  )

  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/feed?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setFeedItems(data.posts || [])
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to load posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('An error occurred while loading posts')
    } finally {
      setLoading(false)
    }
  }

  // Transform feed items to PostWithDetails format
  const transformToPost = (item: FeedItem): PostWithDetails | null => {
    if (item.type === 'repost' && item.post) {
      // For reposts, return the nested post
      return {
        id: item.post.id,
        content: item.post.content,
        createdAt: item.post.createdAt,
        authorId: item.post.author.id,
        author: item.post.author,
        _count: {
          likes: item.post._count.likes,
          replies: item.post._count.replies,
          reposts: item.post._count.reposts,
        },
      }
    } else if (item.type === 'post' && item.author && item.content && item.createdAt && item._count) {
      // For regular posts
      return {
        id: item.id,
        content: item.content,
        createdAt: item.createdAt,
        authorId: item.author.id,
        author: item.author,
        _count: {
          likes: item._count.likes,
          replies: item._count.replies || 0,
          reposts: item._count.reposts,
        },
      }
    }
    return null
  }


  if (!session) {
    return null
  }

  return (
    <div className="w-full">
      {/* New Post Notification */}
      <NewPostNotification onRefresh={fetchPosts} />
      
      {/* Inline Post Creation */}
      <InlinePost onPostCreated={fetchPosts} />

      {/* Posts */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            Retry
          </button>
        </div>
      ) : feedItems.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {filter === 'following' ? 'No posts from people you follow' : 'No posts yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'following'
              ? 'Start following people to see their posts here!'
              : 'Be the first to post something!'}
          </p>
        </div>
      ) : (
        <div>
          {feedItems.map((item) => {
            const post = transformToPost(item)
            if (!post) return null

            const isOwnRepost = item.type === 'repost' && item.repostedBy?.id === session?.user?.id

            return (
              <div key={item.id}>
                {item.type === 'repost' && (
                  // Repost indicator
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.226 2.226V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.226-2.226c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.226 2.226c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.768.293 1.06 0l2.226-2.226V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" />
                      </svg>
                      <span>{isOwnRepost ? 'You reposted' : `${item.repostedBy?.name || item.repostedBy?.userID || 'Someone'} reposted`}</span>
                    </div>
                  </div>
                )}
            <PostCard
              post={post}
              onUpdate={fetchPosts}
              clickable={true}
            />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

