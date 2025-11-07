/**
 * User-Friendly Error Messages
 * Centralized error messages for better UX
 */

import { ErrorCode } from '@/types/api/errors'

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication errors
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',

  // Validation errors
  VALIDATION_ERROR: 'The provided data is invalid. Please check your input and try again.',
  INVALID_INPUT: 'Invalid input provided. Please check your data and try again.',
  MISSING_REQUIRED_FIELD: 'Required fields are missing. Please fill in all required fields.',

  // Resource errors
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'This resource already exists.',
  RESOURCE_CONFLICT: 'A conflict occurred with the requested resource.',

  // Business logic errors
  CHARACTER_LIMIT_EXCEEDED: 'The content exceeds the character limit. Please shorten your message.',
  INVALID_USERID: 'The userID format is invalid. Please use only letters, numbers, and underscores.',
  USERID_TAKEN: 'This userID is already taken. Please choose a different one.',

  // Server errors
  INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
  DATABASE_ERROR: 'A database error occurred. Please try again later.',
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(code: ErrorCode, defaultMessage?: string): string {
  return ERROR_MESSAGES[code] || defaultMessage || 'An error occurred. Please try again.'
}

/**
 * Get error message with context
 */
export function getErrorMessage(
  code: ErrorCode,
  customMessage?: string,
  details?: Record<string, unknown>
): string {
  const baseMessage = customMessage || getUserFriendlyMessage(code)

  // Add details if provided
  if (details && Object.keys(details).length > 0) {
    const detailStr = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
    return `${baseMessage} (${detailStr})`
  }

  return baseMessage
}

