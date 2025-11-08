'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PostCard } from './PostCard'
import { InlinePost } from './InlinePost'
import { NewPostNotification } from './NewPostNotification'
import { useHomeFilter } from './HomeHeader'

interface Post {
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
    comments: number
    reposts: number
  }
}

export function HomeFeed() {
  const { data: session } = useSession()
  const router = useRouter()
  const { filter } = useHomeFilter()
  const [posts, setPosts] = useState<Post[]>([])
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

  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/feed?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
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
      ) : posts.length === 0 ? (
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
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={fetchPosts}
              clickable={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

