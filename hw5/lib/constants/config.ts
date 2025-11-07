/**
 * Application Configuration
 * Centralized configuration values for the application
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  NAME: 'heya',
  DESCRIPTION: 'A Twitter-like social media platform',
} as const

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
  UPDATE_AGE: 24 * 60 * 60, // 24 hours in seconds
} as const

/**
 * API configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

/**
 * Feed configuration
 */
export const FEED_CONFIG = {
  DEFAULT_FILTER: 'all' as const,
  FILTER_OPTIONS: ['all', 'following'] as const,
} as const

