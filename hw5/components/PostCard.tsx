'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { parsePostContent, formatUrl } from '@/lib/postUtils'
import { useSession } from 'next-auth/react'

interface PostCardProps {
  post: {
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
  onDelete?: (postId: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { data: session } = useSession()
  const isOwnPost = session?.user?.id === post.author.id
  const parsedContent = parsePostContent(post.content)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Link href={`/profile/${post.author.userID}`} className="flex-shrink-0">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {post.author.name?.[0]?.toUpperCase() || post.author.userID[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </Link>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${post.author.userID}`}
                className="font-semibold text-gray-900 dark:text-white hover:underline"
              >
                {post.author.name || 'User'}
              </Link>
              <Link
                href={`/profile/${post.author.userID}`}
                className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
              >
                @{post.author.userID}
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
              <Link
                href={`/post/${post.id}`}
                className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
              >
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Link>
              {isOwnPost && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
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
                        {onDelete && (
                          <button
                            onClick={() => onDelete(post.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Post Text with Links/Hashtags/Mentions */}
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
            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
              {/* Comment Button */}
              <Link
                href={`/post/${post.id}`}
                className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">{post._count.comments}</span>
              </Link>

              {/* Repost Button */}
              <button className="flex items-center gap-2 hover:text-green-500 dark:hover:text-green-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12v1m7 1.5l-3 3m0 0l3 3m-3-3H2m9-9h.582m-15.356 2A8.001 8.001 0 0120 12v1m-7-1.5l3 3m0 0l3 3m-3-3H22" />
                </svg>
                <span className="text-sm">{post._count.reposts}</span>
              </button>

              {/* Like Button */}
              <button className="flex items-center gap-2 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">{post._count.likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

