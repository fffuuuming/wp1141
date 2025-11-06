/**
 * UserID validation rules:
 * - Length: 3-20 characters
 * - Allowed characters: alphanumeric (a-z, A-Z, 0-9) and underscore (_)
 * - Must start with a letter or underscore
 * - Case-insensitive uniqueness
 */
export const USERID_MIN_LENGTH = 3
export const USERID_MAX_LENGTH = 20
export const USERID_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/

export interface UserIDValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates userID format (client-safe, no database access)
 */
export function validateUserIDFormat(userID: string): UserIDValidationResult {
  if (!userID || userID.trim().length === 0) {
    return { valid: false, error: 'UserID is required' }
  }

  const trimmed = userID.trim()

  if (trimmed.length < USERID_MIN_LENGTH) {
    return {
      valid: false,
      error: `UserID must be at least ${USERID_MIN_LENGTH} characters long`,
    }
  }

  if (trimmed.length > USERID_MAX_LENGTH) {
    return {
      valid: false,
      error: `UserID must be at most ${USERID_MAX_LENGTH} characters long`,
    }
  }

  if (!USERID_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error:
        'UserID can only contain letters, numbers, and underscores. Must start with a letter or underscore.',
    }
  }

  return { valid: true }
}
