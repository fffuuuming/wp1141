/**
 * Tests for constants
 */

import { POST_CONTENT, USER_PROFILE, USERID, STRING_VALIDATION } from '@/lib/constants/validation'
import { POST_MAX_CHARS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants/limits'

describe('Constants', () => {
  describe('Validation Constants', () => {
    it('should have correct POST_CONTENT limits', () => {
      expect(POST_CONTENT.MIN_LENGTH).toBe(1)
      expect(POST_CONTENT.MAX_LENGTH).toBe(10000)
      expect(POST_CONTENT.MAX_CHARS).toBe(280)
    })

    it('should have correct USER_PROFILE limits', () => {
      expect(USER_PROFILE.NAME_MAX_LENGTH).toBe(100)
      expect(USER_PROFILE.BIO_MAX_LENGTH).toBe(500)
    })

    it('should have correct USERID limits', () => {
      expect(USERID.MIN_LENGTH).toBe(3)
      expect(USERID.MAX_LENGTH).toBe(20)
    })

    it('should have correct STRING_VALIDATION limits', () => {
      expect(STRING_VALIDATION.MIN_LENGTH).toBe(1)
    })
  })

  describe('Limit Constants', () => {
    it('should have correct pagination limits', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(50)
      expect(MAX_PAGE_SIZE).toBe(100)
    })

    it('should have POST_MAX_CHARS for backward compatibility', () => {
      expect(POST_MAX_CHARS).toBe(280)
      expect(POST_MAX_CHARS).toBe(POST_CONTENT.MAX_CHARS)
    })
  })
})

