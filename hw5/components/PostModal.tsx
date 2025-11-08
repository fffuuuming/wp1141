'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { calculateCharacterCount, parsePostContent, formatUrl } from '@/lib/postUtils'
import { POST_CONTENT } from '@/lib/constants/validation'

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  draftContent?: string
  draftId?: string
}

export function PostModal({ isOpen, onClose, draftContent = '', draftId: initialDraftId }: PostModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState(draftContent)
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(initialDraftId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showDraftsDropdown, setShowDraftsDropdown] = useState(false)
  const [drafts, setDrafts] = useState<Array<{ id: string; content: string; updatedAt: string }>>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [mounted, setMounted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const draftsDropdownRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true)
  }, [])

  const charCount = calculateCharacterCount(content)
  const maxChars = POST_CONTENT.MAX_CHARS
  const remainingChars = maxChars - charCount
  const isOverLimit = charCount > maxChars

  // Load draft content when provided
  useEffect(() => {
    if (draftContent) {
      setContent(draftContent)
    }
  }, [draftContent])

  // Fetch drafts when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchDrafts()
    }
  }, [isOpen, session])

  // Close drafts dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (draftsDropdownRef.current && !draftsDropdownRef.current.contains(event.target as Node)) {
        setShowDraftsDropdown(false)
      }
    }

    if (showDraftsDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDraftsDropdown])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false)
      setError('')
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, content])

  const handleClose = () => {
    if (content.trim()) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
      setContent('')
      setError('')
    }
  }

  const handleDiscard = async () => {
    setContent('')
    setError('')
    setShowDiscardConfirm(false)
    onClose()
  }

  const fetchDrafts = async () => {
    if (!session?.user?.id) return

    setLoadingDrafts(true)
    try {
      const response = await fetch('/api/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts || [])
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
    } finally {
      setLoadingDrafts(false)
    }
  }

  const handleLoadDraft = (draft: { id: string; content: string }) => {
    if (content.trim() && content !== draft.content) {
      // If there's existing content, ask for confirmation
      if (confirm('Loading this draft will replace your current content. Continue?')) {
        setContent(draft.content)
        setCurrentDraftId(draft.id)
        setShowDraftsDropdown(false)
      }
    } else {
      setContent(draft.content)
      setCurrentDraftId(draft.id)
      setShowDraftsDropdown(false)
    }
  }

  const handleDeleteDraft = async (draftIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this draft?')) {
      return
    }

    try {
      const response = await fetch(`/api/drafts/${draftIdToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDrafts(drafts.filter(d => d.id !== draftIdToDelete))
        if (currentDraftId === draftIdToDelete) {
          setCurrentDraftId(undefined)
        }
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    }
  }

  const handleSaveFromConfirm = async () => {
    if (!session?.user?.id) {
      setShowDiscardConfirm(false)
      return
    }

    setLoading(true)
    try {
      const url = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts'
      const method = currentDraftId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentDraftId(data.draft.id)
        await fetchDrafts() // Refresh drafts list
        setShowDiscardConfirm(false)
        onClose()
        setContent('')
        setError('')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save draft')
        setShowDiscardConfirm(false)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setError('An error occurred while saving draft')
      setShowDiscardConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const url = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts'
      const method = currentDraftId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentDraftId(data.draft.id)
        await fetchDrafts() // Refresh drafts list
        onClose()
        setContent('')
        setError('')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setError('An error occurred while saving draft')
    } finally {
      setLoading(false)
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

      // If there was a draft, delete it
      if (currentDraftId) {
        await fetch(`/api/drafts/${currentDraftId}`, {
          method: 'DELETE',
        })
        await fetchDrafts() // Refresh drafts list
      }

      // Close modal and refresh
      setContent('')
      setError('')
      setLoading(false) // Reset loading state before closing
      onClose()
      router.refresh()
      // Trigger a custom event to refresh the feed
      window.dispatchEvent(new Event('postCreated'))
    } catch (error) {
      console.error('Error creating post:', error)
      setError('An error occurred while creating post')
      setLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  const parsedContent = parsePostContent(content)

  const modalContent = (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl min-w-[90%] sm:min-w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
            <div className="relative">
              <button
                onClick={() => setShowDraftsDropdown(!showDraftsDropdown)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="View drafts"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              {/* Drafts Dropdown */}
              {showDraftsDropdown && (
                <div
                  ref={draftsDropdownRef}
                  className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Drafts</h3>
                  </div>
                  {loadingDrafts ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Loading drafts...
                    </div>
                  ) : drafts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No drafts saved
                    </div>
                  ) : (
                    <div className="p-2">
                      {drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="p-3 mb-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                          onClick={() => handleLoadDraft(draft)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white line-clamp-2 break-words">
                                {draft.content || '(Empty draft)'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteDraft(draft.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity"
                              title="Delete draft"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* User Avatar */}
            <div className="flex gap-4 mb-4">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              
              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                    setError('')
                  }}
                  placeholder="What's happening?"
                  className="w-full min-h-[200px] px-0 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none resize-none focus:outline-none text-lg"
                  style={{ fontFamily: 'inherit' }}
                />

                {/* Preview of parsed content (for visual feedback) */}
                {content && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
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
                            <a
                              key={index}
                              href={`/profile/${userID}`}
                              className="text-blue-500 hover:underline"
                            >
                              {part.content}
                            </a>
                          )
                        } else {
                          return <span key={index}>{part.content}</span>
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Character Counter */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-semibold ${
                    remainingChars < 0
                      ? 'text-red-500'
                      : remainingChars < 20
                      ? 'text-yellow-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {remainingChars} characters remaining
                </span>
                {remainingChars < 0 && (
                  <span className="text-xs text-red-500">
                    (Over limit by {Math.abs(remainingChars)})
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              onClick={handlePost}
              disabled={loading || isOverLimit || !content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Save your post?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have unsaved changes. Would you like to save as draft or discard?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleDiscard}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Discard
              </button>
              <button
                onClick={handleSaveFromConfirm}
                disabled={loading || !content.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return createPortal(modalContent, document.body)
}

