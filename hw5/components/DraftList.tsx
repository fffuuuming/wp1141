'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { PostModal } from './PostModal'

interface Draft {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

export function DraftList() {
  const { data: session } = useSession()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDrafts()
    }
  }, [session])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts || [])
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return
    }

    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDrafts(drafts.filter(d => d.id !== draftId))
        if (selectedDraft?.id === draftId) {
          setSelectedDraft(null)
          setShowPostModal(false)
        }
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    }
  }

  const handleEditDraft = (draft: Draft) => {
    setSelectedDraft(draft)
    setShowPostModal(true)
  }

  const handleModalClose = () => {
    setShowPostModal(false)
    setSelectedDraft(null)
    fetchDrafts() // Refresh drafts list
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500 dark:text-gray-400">Loading drafts...</p>
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500 dark:text-gray-400">No drafts saved</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Your Drafts
        </h3>
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words mb-2">
                  {draft.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEditDraft(draft)}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDraft(draft.id)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPostModal && selectedDraft && (
        <PostModal
          isOpen={showPostModal}
          onClose={handleModalClose}
          draftContent={selectedDraft.content}
          draftId={selectedDraft.id}
        />
      )}
    </>
  )
}

