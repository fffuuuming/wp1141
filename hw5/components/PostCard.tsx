'use client'

import { useSession } from 'next-auth/react'
import { usePostLike, usePostRepost, usePostDelete } from '@/hooks'
import { PostHeader, PostContent, PostActions, DeleteButton } from '@/components/shared'
import { Avatar, Timestamp } from '@/components/ui'
import type { PostCardProps } from '@/types/components/props'

export function PostCard({ post, onDelete, onUpdate, clickable = false, variant = 'home' }: PostCardProps) {
  const { data: session } = useSession()
  const isOwnPost = session?.user?.id === post.author.id
  
  // Use custom hooks for interactions
  const { liked, likeCount, toggleLike } = usePostLike(post.id, post._count.likes)
  const { reposted, repostCount, toggleRepost } = usePostRepost(post.id, post._count.reposts)
  const { deletePost: handleDelete } = usePostDelete(post.id)

  const handleDeleteClick = async () => {
    const success = await handleDelete()
    if (success && onDelete) {
      onDelete(post.id)
    }
  }

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
                isOwnPost && onDelete ? (
                  <div className="relative group">
                    <button
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    <div className="absolute right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
                        <DeleteButton onDelete={handleDeleteClick} />
                      </div>
                    </div>
                  </div>
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
              replyCount={post._count.replies}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

