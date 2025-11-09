'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { parsePostContent, formatUrl } from '@/lib/postUtils'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Avatar } from '@/components/ui'

interface CommentCardProps {
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
  onReply?: () => void
  showReplyButton?: boolean
}

export function CommentCard({ comment, onDelete, onReply, showReplyButton = false }: CommentCardProps) {
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
    // Navigate to comment detail page
    window.location.href = `/comment/${comment.id}`
  }

  return (
    <div
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Avatar
            user={comment.author}
            href={`/profile/${comment.author.userID}`}
            size="sm"
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
                className="font-semibold text-gray-900 dark:text-white hover:underline text-sm"
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
                className="text-gray-500 dark:text-gray-400 hover:underline text-xs"
              >
                @{comment.author.userID}
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-xs">·</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {isOwnComment && onDelete && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">·</span>
                  <div className="relative group">
                    <button
                      onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="More options"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {showDeleteMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-10">
                        <button
                          onClick={() => {
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
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap break-words mb-2 text-sm">
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
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Like functionality can be added later
                }}
                className="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{comment._count.likes}</span>
              </button>
              {showReplyButton && onReply && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReply()
                  }}
                  className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Reply</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

