'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { calculateCharacterCount } from '@/lib/postUtils'
import { Avatar } from '@/components/ui'

export function InlinePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const charCount = calculateCharacterCount(content)
  const maxChars = 280
  const remainingChars = maxChars - charCount
  const isOverLimit = charCount > maxChars

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleFocus = () => {
    setExpanded(true)
  }

  const handleBlur = () => {
    // Only collapse if content is empty
    if (!content.trim()) {
      setExpanded(false)
    }
  }

  const handlePost = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to post')
      return
    }

    if (isOverLimit) {
      setError(`Post exceeds ${maxChars} character limit`)
      return
    }

    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/posts', {
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
        setError(data.error || 'Failed to create post')
        setLoading(false)
        return
      }

      // Clear content and collapse
      setContent('')
      setExpanded(false)
      setError('')
      
      // Refresh feed
      if (onPostCreated) {
        onPostCreated()
      }
      router.refresh()
      window.dispatchEvent(new Event('postCreated'))
    } catch (error) {
      console.error('Error creating post:', error)
      setError('An error occurred while creating post')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
      expanded ? 'bg-white dark:bg-gray-900' : ''
    }`}>
      <div className="p-4">
        <div className="flex gap-3">
          {/* Profile Avatar */}
          <Avatar
            user={{
              id: session.user.id,
              userID: session.user.userID || '',
              name: session.user.name || null,
              image: session.user.image || null,
            }}
          />

          {/* Post Input Area */}
          <div className="flex-1 min-w-0">
            {expanded && (
              <div className="mb-3">
                <button className="px-3 py-1.5 text-sm font-semibold text-blue-500 border border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  Everyone
                  <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError('')
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="What's happening?"
              className="w-full min-h-[60px] px-0 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none resize-none focus:outline-none text-lg"
              style={{ fontFamily: 'inherit' }}
            />

            {expanded && (
              <>
                <div className="mb-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Everyone can reply
                </div>

                {/* Media Icons */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Media">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="GIF">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Poll">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Emoji">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Location">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Character Counter and Post Button */}
                  <div className="flex items-center gap-3">
                    {content && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            remainingChars < 0
                              ? 'text-red-500'
                              : remainingChars < 20
                              ? 'text-yellow-500'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {remainingChars}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handlePost}
                      disabled={loading || isOverLimit || !content.trim()}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Posting...
                        </span>
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
                    <p className="text-xs font-medium text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

