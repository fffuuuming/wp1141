'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PostCard } from './PostCard'
import { CommentInput } from './CommentInput'
import { CommentsList } from './CommentsList'
import { usePusherChannel } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

interface PostDetailContentProps {
  postId: string
}

export function PostDetailContent({ postId }: PostDetailContentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [postId])

  // Debug: Log subscription info
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && session?.user?.id) {
      const channelName = PUSHER_CHANNELS.post(postId)
      console.log(`[PostDetailContent] Setting up subscriptions for post ${postId}`)
      console.log(`[PostDetailContent] Channel name: "${channelName}"`)
      console.log(`[PostDetailContent] Session user ID: ${session.user.id}`)
    }
  }, [postId, session?.user?.id])

  // Listen for real-time like updates and refresh post
  // Subscribe as soon as session is available (don't wait for post to load)
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.LIKE,
    (data: { postId: string; userId: string; count: number; liked: boolean }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PostDetailContent] Received like event for post ${postId}:`, data)
      }
      // Only update if it's not from the current user (to avoid double updates)
      if (data.userId !== session?.user?.id) {
        // Update post state if it exists
        if (post) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[PostDetailContent] Updating like count from ${post._count.likes} to ${data.count}`)
          }
          setPost((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              likes: data.count,
            },
          }))
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[PostDetailContent] Post not loaded yet, skipping update`)
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[PostDetailContent] Ignoring like event from current user`)
        }
      }
    },
    !!session?.user?.id // Subscribe immediately when session is available
  )

  // Listen for real-time unlike updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.UNLIKE,
    (data: { postId: string; userId: string; count: number; liked: boolean }) => {
      if (data.userId !== session?.user?.id) {
        if (post) {
          setPost((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              likes: data.count,
            },
          }))
        }
      }
    },
    !!session?.user?.id // Subscribe immediately when session is available
  )

  // Listen for real-time repost updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.REPOST,
    (data: { postId: string; userId: string; count: number; reposted: boolean }) => {
      if (data.userId !== session?.user?.id) {
        if (post) {
          setPost((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              reposts: data.count,
            },
          }))
        }
      }
    },
    !!session?.user?.id // Subscribe immediately when session is available
  )

  // Listen for real-time unrepost updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.UNREPOST,
    (data: { postId: string; userId: string; count: number; reposted: boolean }) => {
      if (data.userId !== session?.user?.id) {
        if (post) {
          setPost((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              reposts: data.count,
            },
          }))
        }
      }
    },
    !!session?.user?.id // Subscribe immediately when session is available
  )

  // Listen for real-time comment created updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.COMMENT_CREATED,
    (data: { postId: string; commentId: string; userId: string; count: number }) => {
      if (data.userId !== session?.user?.id) {
        if (post) {
          setPost((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              replies: data.count,
            },
          }))
        }
      }
    },
    !!session?.user?.id // Subscribe immediately when session is available
  )

  // Listen for real-time comment deleted updates
  usePusherChannel(
    PUSHER_CHANNELS.post(postId),
    PUSHER_EVENTS.COMMENT_DELETED,
    (data: { postId: string; commentId: string; userId: string; count: number }) => {
      if (data.userId !== session?.user?.id) {
        if (post) {
          setPost((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              replies: data.count,
            },
          }))
        }
      }
    },
    !!session?.user?.id // Subscribe immediately when session is available
  )

  const fetchPost = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else {
        // Post not found, redirect to home
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postIdToDelete: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postIdToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Redirect to home after deletion
        router.push('/')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('An error occurred while deleting post')
    }
  }

  const handleReplyCreated = () => {
    // Refresh the post to update reply count
    fetchPost()
    // Trigger event to refresh comments list
    window.dispatchEvent(new Event('commentCreated'))
  }

  const handleCommentClick = (commentId: string) => {
    // Navigate to the comment's post page
    router.push(`/post/${commentId}`)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
      </div>
    )
  }

  return (
    <>
      {/* Main Post Section */}
      <div>
        <PostCard
          post={{
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            author: post.author,
            _count: post._count,
          }}
          onDelete={handleDeletePost}
          clickable={false}
          variant="post"
        />
      </div>

      {/* Post Your Reply Section */}
      <CommentInput
        postId={post.id}
        onCommentCreated={handleReplyCreated}
      />

      {/* Comments Section */}
      <CommentsList
        postId={post.id}
        onCommentClick={handleCommentClick}
      />
    </>
  )
}
