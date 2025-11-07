/**
 * Post Header Component
 * Shared component for displaying post author info and timestamp
 */

import Link from 'next/link'
import { Avatar } from '../ui/Avatar'
import { Timestamp } from '../ui/Timestamp'
import type { UserBasic } from '@/types/entities/user'

interface PostHeaderProps {
  author: UserBasic
  createdAt: Date | string
  postId: string
  showActions?: boolean
  actions?: React.ReactNode
  className?: string
}

export function PostHeader({
  author,
  createdAt,
  postId,
  showActions = false,
  actions,
  className = '',
}: PostHeaderProps) {
  return (
    <div className={`mb-1 flex items-start justify-between ${className}`}>
      <div className="flex items-start gap-3">
        <Avatar user={author} href={`/profile/${author.userID}`} />
        <div>
          <Link
            href={`/profile/${author.userID}`}
            className="font-semibold text-gray-900 dark:text-white hover:underline block"
          >
            {author.name || 'User'}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <Link
              href={`/profile/${author.userID}`}
              className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
            >
              @{author.userID}
            </Link>
            <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
            <Timestamp date={createdAt} href={`/post/${postId}`} />
          </div>
        </div>
      </div>
      {showActions && actions && <div>{actions}</div>}
    </div>
  )
}

