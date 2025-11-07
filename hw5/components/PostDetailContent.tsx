'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PostCard } from './PostCard'
import { CommentInput } from './CommentInput'
import { CommentsList } from './CommentsList'

interface PostDetailContentProps {
  postId: string
}

export function PostDetailContent({ postId }: PostDetailContentProps) {
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [postId])

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
