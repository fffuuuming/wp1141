'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PostCard } from './PostCard'
import { InlinePost } from './InlinePost'

type FilterType = 'all' | 'following'

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
  const [filter, setFilter] = useState<FilterType>('all')
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove post from list
        setPosts(posts.filter(p => p.id !== postId))
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('An error occurred while deleting post')
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="w-full">
      {/* Inline Post Creation */}
      <InlinePost onPostCreated={fetchPosts} />

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 font-semibold text-sm relative transition-colors ${
              filter === 'all'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All
            {filter === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`flex-1 px-4 py-3 font-semibold text-sm relative transition-colors ${
              filter === 'following'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Following
            {filter === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

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
              onDelete={handleDeletePost}
              onUpdate={fetchPosts}
              clickable={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

