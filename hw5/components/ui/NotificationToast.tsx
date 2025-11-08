/**
 * Notification Toast Component
 * Non-intrusive notification for real-time updates
 */

'use client'

import { useState, useEffect } from 'react'

interface NotificationToastProps {
  message: string
  duration?: number
  onClose?: () => void
}

export function NotificationToast({ message, duration = 3000, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        setTimeout(onClose, 300) // Wait for fade-out animation
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 min-w-[200px] max-w-[400px] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-blue-500 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-900 dark:text-gray-100">{message}</p>
      </div>
    </div>
  )
}

interface NotificationManagerProps {
  children: React.ReactNode
}

/**
 * Notification Manager Component
 * Manages notification toasts for real-time updates
 */
export function NotificationManager({ children }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string }>>([])

  useEffect(() => {
    // This component can be extended to listen for Pusher events
    // and show notifications for new posts/interactions
    // For now, it's a placeholder for future enhancement
  }, [])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  )
}

