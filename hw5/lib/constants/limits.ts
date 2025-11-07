/**
 * Application Limits and Constraints
 * Centralized constants for validation and business rules
 */

/**
 * Post/Comment character limits
 * @deprecated Use POST_CONTENT.MAX_CHARS from validation.ts instead
 */
export const POST_MAX_CHARS = 280

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 100

/**
 * Recursion limits (for nested replies)
 */
export const MAX_RECURSION_DEPTH = 100

/**
 * Rate limiting (if needed in future)
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 100

