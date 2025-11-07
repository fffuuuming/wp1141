'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ExpandableCommentInputProps {
  postId: string
  parentId?: string
  onCommentCreated?: () => void
  replyingTo?: {
    userID: string
    name: string | null
  }
}

export function ExpandableCommentInput({ postId, parentId, onCommentCreated, replyingTo }: ExpandableCommentInputProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isExpanded) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content, isExpanded])

  // Focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      setError('You must be logged in to comment')
      return
    }

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = parentId
        ? `/api/comments/${parentId}/replies`
        : `/api/posts/${postId}/comments`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create comment')
        setLoading(false)
        return
      }

      // Clear content and collapse
      setContent('')
      setIsExpanded(false)
      
      // Trigger comment created event to refresh comments list
      window.dispatchEvent(new Event('commentCreated'))
      
      if (onCommentCreated) {
        onCommentCreated()
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      setError('An error occurred while creating comment')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className={`border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        isExpanded ? 'bg-white dark:bg-gray-900' : ''
      }`}
    >
      {!isExpanded ? (
        // Collapsed state - compact input
        <div 
          className="px-4 py-3 flex items-center gap-3 cursor-text"
          onClick={() => setIsExpanded(true)}
        >
          {/* Avatar */}
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {session.user.name?.[0]?.toUpperCase() || session.user.userID?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}

          {/* Placeholder text */}
          <div className="flex-1 text-gray-500 dark:text-gray-400 text-sm">
            Post your reply
          </div>

          {/* Reply button (disabled in collapsed state) */}
          <button
            type="button"
            disabled
            className="px-4 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-full text-sm cursor-not-allowed flex-shrink-0"
          >
            Reply
          </button>
        </div>
      ) : (
        // Expanded state - full input form
        <form onSubmit={handleSubmit} className="px-4 py-3">
          {replyingTo && parentId && (
            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Replying to{' '}
              <button
                type="button"
                onClick={() => router.push(`/profile/${replyingTo.userID}`)}
                className="text-blue-500 hover:underline"
              >
                @{replyingTo.userID}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {/* Avatar */}
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {session.user.name?.[0]?.toUpperCase() || session.user.userID?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}

            {/* Input Area */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setError('')
                }}
                onBlur={(e) => {
                  // Don't collapse if there's content or if clicking on submit button
                  if (!content.trim() && !e.relatedTarget) {
                    // Small delay to allow button click to register
                    setTimeout(() => {
                      if (!content.trim()) {
                        setIsExpanded(false)
                      }
                    }, 200)
                  }
                }}
                placeholder="Post your reply"
                className="w-full min-h-[60px] px-0 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none resize-none focus:outline-none"
                style={{ fontFamily: 'inherit' }}
              />

              {error && (
                <div className="mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
                  <p className="text-xs font-medium text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Media icons (optional - can be added later) */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-blue-500">
                  {/* Placeholder for media icons */}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContent('')
                      setIsExpanded(false)
                    }}
                    className="px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Posting...
                      </span>
                    ) : (
                      'Reply'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

