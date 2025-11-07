/**
 * Utility functions for post creation:
 * - Character counting (with special rules for links, hashtags, mentions)
 * - Link detection
 * - Hashtag parsing
 * - Mention parsing
 */

// URL regex pattern (matches http, https, www, and common domains)
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi

// Hashtag regex: # followed by alphanumeric and underscores
const HASHTAG_REGEX = /#[\w]+/g

// Mention regex: @ followed by alphanumeric and underscores (3-20 chars, starting with letter/underscore)
const MENTION_REGEX = /@[a-zA-Z_][a-zA-Z0-9_]{2,19}/g

/**
 * Detect all URLs in text
 */
export function detectLinks(text: string): string[] {
  const matches = text.match(URL_REGEX)
  return matches || []
}

/**
 * Detect all hashtags in text
 */
export function detectHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_REGEX)
  return matches || []
}

/**
 * Detect all mentions in text
 */
export function detectMentions(text: string): string[] {
  const matches = text.match(MENTION_REGEX)
  return matches || []
}

/**
 * Calculate character count for post content
 * Rules:
 * - Regular text: 1 char each
 * - Links: 23 chars each (regardless of actual length)
 * - Hashtags: 0 chars (don't count)
 * - Mentions: 0 chars (don't count)
 */
export function calculateCharacterCount(text: string): number {
  if (!text) return 0

  // Find all links
  const links = detectLinks(text)
  
  // Find all hashtags
  const hashtags = detectHashtags(text)
  
  // Find all mentions
  const mentions = detectMentions(text)

  // Start with full text length
  let count = text.length

  // Subtract actual length of links, then add 23 for each link
  links.forEach(link => {
    count = count - link.length + 23
  })

  // Subtract length of hashtags (they don't count)
  hashtags.forEach(hashtag => {
    count = count - hashtag.length
  })

  // Subtract length of mentions (they don't count)
  mentions.forEach(mention => {
    count = count - mention.length
  })

  return Math.max(0, count) // Ensure non-negative
}

/**
 * Parse text and convert links, hashtags, and mentions to HTML/React elements
 * Returns an array of text segments and formatted elements
 */
export function parsePostContent(text: string): Array<{ type: 'text' | 'link' | 'hashtag' | 'mention'; content: string; original: string }> {
  if (!text) return []

  const parts: Array<{ type: 'text' | 'link' | 'hashtag' | 'mention'; content: string; original: string }> = []
  let lastIndex = 0

  // Find all matches with their positions
  const matches: Array<{ start: number; end: number; type: 'link' | 'hashtag' | 'mention'; content: string }> = []

  // Find links
  let linkMatch
  const linkRegex = new RegExp(URL_REGEX)
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    matches.push({
      start: linkMatch.index,
      end: linkMatch.index + linkMatch[0].length,
      type: 'link',
      content: linkMatch[0],
    })
  }

  // Find hashtags
  let hashtagMatch
  const hashtagRegex = new RegExp(HASHTAG_REGEX)
  while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
    matches.push({
      start: hashtagMatch.index,
      end: hashtagMatch.index + hashtagMatch[0].length,
      type: 'hashtag',
      content: hashtagMatch[0],
    })
  }

  // Find mentions
  let mentionMatch
  const mentionRegex = new RegExp(MENTION_REGEX)
  while ((mentionMatch = mentionRegex.exec(text)) !== null) {
    matches.push({
      start: mentionMatch.index,
      end: mentionMatch.index + mentionMatch[0].length,
      type: 'mention',
      content: mentionMatch[0],
    })
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start)

  // Remove overlapping matches (prioritize: link > hashtag > mention)
  const filteredMatches: typeof matches = []
  for (const match of matches) {
    const overlaps = filteredMatches.some(
      m => (match.start < m.end && match.end > m.start)
    )
    if (!overlaps) {
      filteredMatches.push(match)
    }
  }

  // Build parts array
  for (const match of filteredMatches) {
    // Add text before match
    if (match.start > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.start),
        original: text.substring(lastIndex, match.start),
      })
    }

    // Add match
    parts.push({
      type: match.type,
      content: match.content,
      original: match.content,
    })

    lastIndex = match.end
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
      original: text.substring(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text, original: text }]
}

/**
 * Format URL for display (add http:// if missing)
 */
export function formatUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('www.')) {
    return `https://${url}`
  }
  return `https://${url}`
}

