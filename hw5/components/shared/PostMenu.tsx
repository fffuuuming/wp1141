'use client'

import { useState, useEffect, useRef } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface PostMenuProps {
  onDelete: () => void | Promise<void>
  className?: string
}

export function PostMenu({ onDelete, className = '' }: PostMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMenu) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showMenu])

  const handleDeleteClick = () => {
    setShowMenu(false)
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setShowConfirm(false)
    await onDelete()
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <div className={`relative ${className}`} ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          aria-label="More options"
          aria-expanded={showMenu}
          aria-haspopup="menu"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="More options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
        {showMenu && (
          <div 
            className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-10"
            role="menu"
            aria-label="Post options"
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDeleteClick()
              }}
              role="menuitem"
              aria-label="Delete post"
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        variant="danger"
      />
    </>
  )
}

