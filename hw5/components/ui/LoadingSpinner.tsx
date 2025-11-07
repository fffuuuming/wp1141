/**
 * Loading Spinner Component
 * Reusable loading spinner with optional message
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClass} border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  )
}

