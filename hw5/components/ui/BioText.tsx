'use client'

import { formatUrl } from '@/lib/postUtils'

// URL regex pattern (matches http, https, www, and common domains)
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi

interface BioTextProps {
  text: string
  className?: string
}

/**
 * Component that renders bio text with clickable links
 * Preserves whitespace and line breaks while making URLs clickable
 */
export function BioText({ text, className = '' }: BioTextProps) {
  if (!text) return null

  // Split text by URLs while preserving the URLs
  const parts: Array<{ type: 'text' | 'link'; content: string }> = []
  let lastIndex = 0
  const urlRegex = new RegExp(URL_REGEX)
  let match
  let hasLinks = false

  // Reset regex lastIndex to ensure we start from the beginning
  urlRegex.lastIndex = 0

  while ((match = urlRegex.exec(text)) !== null) {
    hasLinks = true
    
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add the URL
    const url = match[0]
    parts.push({
      type: 'link',
      content: url,
    })

    lastIndex = match.index + url.length
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    })
  }

  // If no URLs were found, return the text as-is
  if (!hasLinks) {
    return (
      <p className={`whitespace-pre-wrap ${className}`}>
        {text}
      </p>
    )
  }

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          const href = formatUrl(part.content)
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
            >
              {part.content}
            </a>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </p>
  )
}

