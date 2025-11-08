'use client'

import { useState } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface DeleteButtonProps {
  onDelete: () => void | Promise<void>
  label?: string
  className?: string
}

export function DeleteButton({ onDelete, label = 'Delete', className = '' }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
      onDelete()
    }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
    <button
      onClick={handleClick}
      className={`w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      {label}
    </button>
      <ConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to ${label.toLowerCase()}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        variant="danger"
      />
    </>
  )
}

