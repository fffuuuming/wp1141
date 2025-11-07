/**
 * Tests for postUtils
 */

import { calculateCharacterCount, parsePostContent, formatUrl } from '@/lib/postUtils'

describe('postUtils', () => {
  describe('calculateCharacterCount', () => {
    it('should count plain text characters', () => {
      expect(calculateCharacterCount('Hello world')).toBe(11)
    })

    it('should count URLs as 23 characters each', () => {
      const text = 'Check this out: https://example.com/path'
      // Text length: 40, URL: "https://example.com/path" = 24 chars
      // Calculation: 40 - 24 + 23 = 39
      expect(calculateCharacterCount(text)).toBe(39)
    })

    it('should not count hashtags as characters', () => {
      const text = 'This is a #hashtag'
      // "This is a " = 10 chars, #hashtag = 8 chars (not counted)
      // Total: 18 - 8 = 10
      expect(calculateCharacterCount(text)).toBe(10)
    })

    it('should not count mentions as characters', () => {
      const text = 'Hey @username how are you?'
      // "Hey " = 4, "@username" = 9 (not counted), " how are you?" = 13
      // Total: 26 - 9 = 17
      expect(calculateCharacterCount(text)).toBe(17)
    })

    it('should handle multiple URLs, hashtags, and mentions', () => {
      const text = 'Check https://example.com and #hashtag @user'
      // "Check " = 6, URL = 23 (replaces 20), " and " = 5, #hashtag = 8 (not counted), " " = 1, @user = 5 (not counted)
      // Total: 45 - 20 + 23 - 8 - 5 = 35
      expect(calculateCharacterCount(text)).toBe(35)
    })

    it('should handle empty string', () => {
      expect(calculateCharacterCount('')).toBe(0)
    })

    it('should handle only URLs', () => {
      // URL length 23, actual length 20, so: 20 - 20 + 23 = 23
      expect(calculateCharacterCount('https://example.com')).toBe(23)
    })
  })

  describe('parsePostContent', () => {
    it('should parse URLs', () => {
      const result = parsePostContent('Check https://example.com')
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('link')
      expect(result[1].content).toBe('https://example.com')
    })

    it('should parse hashtags', () => {
      const result = parsePostContent('This is a #hashtag')
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('hashtag')
      expect(result[1].content).toBe('#hashtag')
    })

    it('should parse mentions', () => {
      const result = parsePostContent('Hey @username')
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('mention')
      expect(result[1].content).toBe('@username')
    })
  })

  describe('formatUrl', () => {
    it('should format URL with protocol', () => {
      expect(formatUrl('https://example.com')).toBe('https://example.com')
    })

    it('should add protocol if missing', () => {
      expect(formatUrl('example.com')).toBe('https://example.com')
    })
  })
})

