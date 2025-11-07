/**
 * Post Content Component
 * Shared component for rendering post content with links, hashtags, mentions
 */

import Link from 'next/link'
import { parsePostContent, formatUrl } from '@/lib/postUtils'

interface PostContentProps {
  content: string
  className?: string
}

export function PostContent({ content, className = '' }: PostContentProps) {
  const parsedContent = parsePostContent(content)

  return (
    <div className={`text-gray-900 dark:text-white whitespace-pre-wrap break-words ${className}`}>
      {parsedContent.map((part, index) => {
        if (part.type === 'link') {
          const url = formatUrl(part.content)
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {part.content}
            </a>
          )
        } else if (part.type === 'hashtag') {
          return (
            <span key={index} className="text-blue-500 font-semibold">
              {part.content}
            </span>
          )
        } else if (part.type === 'mention') {
          const userID = part.content.substring(1)
          return (
            <Link
              key={index}
              href={`/profile/${userID}`}
              className="text-blue-500 hover:underline"
            >
              {part.content}
            </Link>
          )
        } else {
          return <span key={index}>{part.content}</span>
        }
      })}
    </div>
  )
}

