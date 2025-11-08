'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { usePostLike, usePostRepost, usePostDelete } from '@/hooks'
import { usePostReplyCount } from '@/hooks/usePostReplyCount'
import { PostHeader, PostContent, PostActions, PostMenu } from '@/components/shared'
import { Avatar, Timestamp } from '@/components/ui'
import type { PostCardProps } from '@/types/components/props'

export function PostCard({ post, onUpdate, clickable = false, variant = 'home' }: PostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  // Use custom hooks for interactions
  // These hooks subscribe to Pusher channels and update counts in real-time
  const { liked, likeCount, toggleLike } = usePostLike(post.id, post._count.likes)
  const { reposted, repostCount, toggleRepost } = usePostRepost(post.id, post._count.reposts)
  const replyCount = usePostReplyCount(post.id, post._count.replies)
  const { deletePost, loading: deleting } = usePostDelete(post.id)

  // Check if current user is the author (only show delete for own posts)
  const isOwnPost = session?.user?.id === post.author.id

  // Debug: Log when PostCard mounts/updates (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PostCard] Rendered for post ${post.id} with counts:`, {
        likes: likeCount,
        reposts: repostCount,
        replies: replyCount,
        initialLikes: post._count.likes,
        initialReposts: post._count.reposts,
        initialReplies: post._count.replies,
      })
    }
  }, [post.id, likeCount, repostCount, replyCount, post._count.likes, post._count.reposts, post._count.replies])

  const handleCardClick = (e: React.MouseEvent) => {
    if (!clickable) return
    
    // Don't navigate if clicking on links, buttons, or interactive elements
    const target = e.target as HTMLElement
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      return
    }
    
    // Navigate to post detail page
    window.location.href = `/post/${post.id}`
  }

  const handleDelete = async () => {
    const success = await deletePost()
    if (success) {
      // If we have an onUpdate callback, call it to refresh the list
      if (onUpdate) {
        onUpdate()
      } else {
        // Otherwise, navigate to home or refresh
        if (variant === 'post') {
          // If we're on the post detail page, redirect to home
          router.push('/')
        } else {
          // Otherwise, just refresh the current page
          window.location.reload()
        }
      }
    } else {
      alert('Failed to delete post')
    }
  }

  return (
    <div 
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${clickable ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Avatar user={post.author} href={`/profile/${post.author.userID}`} />

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Post Header */}
            <PostHeader
              author={post.author}
              createdAt={post.createdAt}
              postId={post.id}
              showActions={isOwnPost}
              actions={
                isOwnPost ? (
                  <PostMenu onDelete={handleDelete} />
                ) : undefined
              }
            />

            {/* Post Content */}
            <PostContent content={post.content} className="mb-3" />

            {/* Detailed Timestamp - only show for post variant */}
            {variant === 'post' && (
              <div className="mb-3">
                <Timestamp date={post.createdAt} format="detailed" />
              </div>
            )}

            {/* Post Actions */}
            <PostActions
              postId={post.id}
              liked={liked}
              likeCount={likeCount}
              onLike={toggleLike}
              reposted={reposted}
              repostCount={repostCount}
              onRepost={toggleRepost}
              replyCount={replyCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

