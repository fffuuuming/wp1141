/**
 * Error Message Component
 * Reusable error message display with optional retry
 */

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-red-500 dark:text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors text-sm"
        >
          Retry
        </button>
      )}
    </div>
  )
}

