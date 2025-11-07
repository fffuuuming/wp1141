/**
 * Empty State Component
 * Reusable empty state display
 */

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message: string
  className?: string
}

export function EmptyState({ icon, title, message, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  )
}

