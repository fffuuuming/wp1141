import { formatDistanceToNow } from 'date-fns'
import { format } from 'date-fns'

/**
 * Format time as short relative time (e.g., "3h", "22m", "2d")
 */
export function formatShortTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const distance = formatDistanceToNow(dateObj, { addSuffix: true })
  
  // Parse the distance string and convert to short format
  if (distance.includes('minute')) {
    const minutes = parseInt(distance.match(/\d+/)?.[0] || '0')
    return `${minutes}m`
  } else if (distance.includes('hour')) {
    const hours = parseInt(distance.match(/\d+/)?.[0] || '0')
    return `${hours}h`
  } else if (distance.includes('day')) {
    const days = parseInt(distance.match(/\d+/)?.[0] || '0')
    return `${days}d`
  } else if (distance.includes('month')) {
    const months = parseInt(distance.match(/\d+/)?.[0] || '0')
    return `${months}mo`
  } else if (distance.includes('year')) {
    const years = parseInt(distance.match(/\d+/)?.[0] || '0')
    return `${years}y`
  } else if (distance.includes('second')) {
    const seconds = parseInt(distance.match(/\d+/)?.[0] || '0')
    return seconds < 60 ? `${seconds}s` : '1m'
  } else {
    // Fallback to original format if we can't parse it
    return distance
  }
}

/**
 * Format detailed timestamp (e.g., "5:32 AM · Nov 7, 2025")
 */
export function formatDetailedTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const timeStr = format(dateObj, 'h:mm a')
  const dateStr = format(dateObj, 'MMM d, yyyy')
  return `${timeStr} · ${dateStr}`
}

