/**
 * Timestamp Component
 * Reusable timestamp display component
 */

import Link from 'next/link'
import { formatShortTime, formatDetailedTime } from '@/lib/timeUtils'

interface TimestampProps {
  date: Date | string
  format?: 'short' | 'detailed'
  href?: string
  className?: string
}

export function Timestamp({ date, format = 'short', href, className = '' }: TimestampProps) {
  const formattedTime = format === 'detailed' 
    ? formatDetailedTime(date)
    : formatShortTime(date)

  if (href) {
    return (
      <Link href={href} className={`text-gray-500 dark:text-gray-400 hover:underline text-sm ${className}`}>
        {formattedTime}
      </Link>
    )
  }

  return (
    <span className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
      {formattedTime}
    </span>
  )
}

