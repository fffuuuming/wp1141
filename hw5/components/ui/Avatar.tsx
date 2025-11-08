/**
 * Avatar Component
 * Reusable avatar component with fallback
 */

import Link from 'next/link'
import type { UserBasic } from '@/types/entities/user'

interface AvatarProps {
  user: UserBasic
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl',
}

export function Avatar({ user, size = 'md', href, className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  const displayName = user.name || user.userID || 'User'
  const initial = displayName[0]?.toUpperCase() || 'U'

  const avatarContent = (
    <>
      {user.image ? (
        <img
          src={user.image}
          alt={displayName}
          className={`${sizeClass} rounded-full object-cover ${className}`}
        />
      ) : (
        <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            {initial}
          </span>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className="flex-shrink-0 transition-opacity duration-200 hover:opacity-80">
        {avatarContent}
      </Link>
    )
  }

  return <div className="flex-shrink-0">{avatarContent}</div>
}

