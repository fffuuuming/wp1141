/**
 * Validation Rules and Constraints
 * Centralized validation constants used across the application
 */

/**
 * Post/Comment validation rules
 */
export const POST_CONTENT = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 10000, // Raw string length limit (before character counting)
  MAX_CHARS: 280, // Character count limit (accounts for links, hashtags, mentions)
} as const

/**
 * User profile validation rules
 */
export const USER_PROFILE = {
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
} as const

/**
 * UserID validation rules
 * Note: These are also defined in lib/userID.ts for backward compatibility
 */
export const USERID = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
} as const

/**
 * String validation rules
 */
export const STRING_VALIDATION = {
  MIN_LENGTH: 1, // Minimum length for required strings
} as const

