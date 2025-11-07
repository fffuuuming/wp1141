/**
 * Delete Button Component
 * Shared component for delete actions with confirmation
 */

interface DeleteButtonProps {
  onDelete: () => void
  label?: string
  className?: string
}

export function DeleteButton({ onDelete, label = 'Delete', className = '' }: DeleteButtonProps) {
  const handleClick = () => {
    if (confirm(`Are you sure you want to ${label.toLowerCase()}?`)) {
      onDelete()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      {label}
    </button>
  )
}

