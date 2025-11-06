import { prisma } from './prisma'
import { validateUserIDFormat, type UserIDValidationResult } from './userID'

/**
 * Checks if userID is unique (case-insensitive)
 * Server-only function - uses Prisma
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
 * Server-only function - uses Prisma
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

