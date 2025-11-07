'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CommentInputProps {
  postId: string
  onCommentCreated?: () => void
}

export function CommentInput({ postId, onCommentCreated }: CommentInputProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      setError('You must be logged in to reply')
      return
    }

    if (!content.trim()) {
      setError('Reply cannot be empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = `/api/posts/${postId}/comments`
      
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
        setError(data.error || 'Failed to create reply')
        setLoading(false)
        return
      }

      // Clear content
      setContent('')
      if (onCommentCreated) {
        onCommentCreated()
      }
    } catch (error) {
      console.error('Error creating reply:', error)
      setError('An error occurred while creating reply')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-200 dark:border-gray-700 p-4">
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
            placeholder="Post your reply"
            className="w-full min-h-[60px] px-0 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none resize-none focus:outline-none"
            style={{ fontFamily: 'inherit' }}
          />

          {error && (
            <div className="mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
              <p className="text-xs font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </form>
  )
}

