'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { calculateCharacterCount } from '@/lib/postUtils'
import { POST_CONTENT } from '@/lib/constants/validation'
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
  const maxChars = POST_CONTENT.MAX_CHARS
  const remainingChars = maxChars - charCount
  const isOverLimit = charCount > maxChars
  const isAtLimit = charCount >= maxChars

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

  if (!session || !session.user?.id) {
    return null
  }

  // Type assertion: session.user has userID from our extended Session type
  const user = session.user as { id: string; userID: string; name?: string | null; email?: string | null; image?: string | null }

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
      expanded ? 'bg-white dark:bg-gray-900' : ''
    }`}>
      <div className={expanded ? 'p-4' : 'px-4 py-2'}>
        <div className="flex gap-3">
          {/* Profile Avatar */}
          <div className={expanded ? '' : 'flex-shrink-0'}>
            <Avatar
              user={{
                id: user.id,
                userID: user.userID || '',
                name: user.name || null,
                image: user.image || null,
              }}
              size={expanded ? 'md' : 'sm'}
            />
          </div>

          {/* Post Input Area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                const newValue = e.target.value
                const newCharCount = calculateCharacterCount(newValue)
                
                // If deleting, always allow
                if (newValue.length < content.length) {
                  setContent(newValue)
                  setError('')
                  return
                }
                
                // If under or at limit, allow
                if (newCharCount <= maxChars) {
                  setContent(newValue)
                  setError('')
                  return
                }
                
                // If over limit, find the maximum prefix that fits
                // Use binary search to find the right length
                let left = content.length
                let right = newValue.length
                let bestLength = left
                
                while (left <= right) {
                  const mid = Math.floor((left + right) / 2)
                  const testValue = newValue.substring(0, mid)
                  const testCount = calculateCharacterCount(testValue)
                  
                  if (testCount <= maxChars) {
                    bestLength = mid
                    left = mid + 1
                  } else {
                    right = mid - 1
                  }
                }
                
                // Set content to the maximum length that fits
                if (bestLength > content.length) {
                  setContent(newValue.substring(0, bestLength))
                  setError('')
                }
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="What's happening?"
              className={`w-full px-0 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none resize-none focus:outline-none ${
                expanded ? 'min-h-[60px] text-lg' : 'min-h-[40px] text-base'
              }`}
              style={{ fontFamily: 'inherit' }}
            />

            {/* Character Counter and Post Button */}
            <div className={`flex items-center justify-end gap-3 ${expanded ? 'mt-3' : 'mt-1'}`}>
              {content && (
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                      {/* Background circle */}
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className={isAtLimit ? 'text-red-200 dark:text-red-900' : 'text-gray-200 dark:text-gray-700'}
                      />
                      {/* Progress circle */}
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        className={isAtLimit ? 'text-red-500' : 'text-blue-500 transition-all duration-300'}
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - Math.min(charCount / maxChars, 1))}`}
                      />
                    </svg>
                    {isAtLimit && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isAtLimit
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
                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  expanded ? 'px-4 py-2' : 'px-3 py-1.5 text-sm'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {expanded && 'Posting...'}
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>

            {expanded && error && (
              <div className="mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
                <p className="text-xs font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

