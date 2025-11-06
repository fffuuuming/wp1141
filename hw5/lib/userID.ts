import { prisma } from './prisma'

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
 * Validates userID format
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

/**
 * Checks if userID is unique (case-insensitive)
 */
export async function checkUserIDUniqueness(
  userID: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        userID: {
          equals: userID,
          mode: 'insensitive',
        },
      },
    })

    if (existing) {
      return {
        available: false,
        error: 'This UserID is already taken. Please choose another one.',
      }
    }

    return { available: true }
  } catch (error) {
    console.error('Error checking userID uniqueness:', error)
    return {
      available: false,
      error: 'An error occurred while checking UserID availability',
    }
  }
}

/**
 * Combined validation: format + uniqueness
 */
export async function validateUserID(
  userID: string
): Promise<UserIDValidationResult> {
  // First check format
  const formatCheck = validateUserIDFormat(userID)
  if (!formatCheck.valid) {
    return formatCheck
  }

  // Then check uniqueness
  const uniquenessCheck = await checkUserIDUniqueness(userID)
  if (!uniquenessCheck.available) {
    return {
      valid: false,
      error: uniquenessCheck.error,
    }
  }

  return { valid: true }
}

