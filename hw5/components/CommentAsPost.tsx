'use client'

import Link from 'next/link'
import { formatShortTime } from '@/lib/timeUtils'
import { parsePostContent, formatUrl } from '@/lib/postUtils'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Avatar } from '@/components/ui'

interface CommentAsPostProps {
  comment: {
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
    }
    postId?: string | null
  }
  onDelete?: (commentId: string) => void
}

export function CommentAsPost({ comment, onDelete }: CommentAsPostProps) {
  const { data: session } = useSession()
  const isOwnComment = session?.user?.id === comment.author.id
  const parsedContent = parsePostContent(comment.content)
  const [showDeleteMenu, setShowDeleteMenu] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on links, buttons, or interactive elements
    const target = e.target as HTMLElement
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // Navigate to comment in post page
    const postId = comment.postId || ''
    if (postId) {
      window.location.href = `/post/${postId}?comment=${comment.id}`
    }
  }

  return (
    <div
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Avatar
            user={comment.author}
            href={`/profile/${comment.author.userID}`}
          />

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${comment.author.userID}`}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  window.location.href = `/profile/${comment.author.userID}`
                }}
                className="font-semibold text-gray-900 dark:text-white hover:underline"
              >
                {comment.author.name || 'User'}
              </Link>
              <Link
                href={`/profile/${comment.author.userID}`}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  window.location.href = `/profile/${comment.author.userID}`
                }}
                className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
              >
                @{comment.author.userID}
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
              <Link
                href={comment.postId ? `/post/${comment.postId}?comment=${comment.id}` : '#'}
                className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
              >
                {formatShortTime(comment.createdAt)}
              </Link>
              {isOwnComment && onDelete && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
                  <div className="relative group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteMenu(!showDeleteMenu)
                      }}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {showDeleteMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(comment.id)
                            setShowDeleteMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Comment Text with Links/Hashtags/Mentions */}
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap break-words mb-3">
              {parsedContent.map((part, index) => {
                if (part.type === 'link') {
                  const url = formatUrl(part.content)
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {part.content}
                    </a>
                  )
                } else if (part.type === 'hashtag') {
                  return (
                    <span key={index} className="text-blue-500 font-semibold">
                      {part.content}
                    </span>
                  )
                } else if (part.type === 'mention') {
                  const userID = part.content.substring(1)
                  return (
                    <Link
                      key={index}
                      href={`/profile/${userID}`}
                      className="text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {part.content}
                    </Link>
                  )
                } else {
                  return <span key={index}>{part.content}</span>
                }
              })}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
              {/* Comment/Reply Button */}
              <Link
                href={comment.postId ? `/post/${comment.postId}?comment=${comment.id}` : '#'}
                className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">{comment._count.replies}</span>
              </Link>

              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Like functionality can be added later
                }}
                className="flex items-center gap-2 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">{comment._count.likes}</span>
              </button>

              {/* Reply Button */}
              <Link
                href={comment.postId ? `/post/${comment.postId}?comment=${comment.id}` : '#'}
                className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="text-sm">Reply</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

