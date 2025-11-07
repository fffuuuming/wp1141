/**
 * User validation schemas
 * Zod schemas for user-related validation
 */

import { z } from 'zod'
import { validateUserIDFormat, USERID_MIN_LENGTH, USERID_MAX_LENGTH } from '@/lib/userID'
import { USER_PROFILE, USERID, STRING_VALIDATION } from '@/lib/constants/validation'

/**
 * Register userID schema
 */
export const registerUserIDSchema = z.object({
  userID: z
    .string()
    .min(USERID.MIN_LENGTH, `UserID must be at least ${USERID.MIN_LENGTH} characters`)
    .max(USERID.MAX_LENGTH, `UserID must be at most ${USERID.MAX_LENGTH} characters`)
    .refine(
      (val) => validateUserIDFormat(val).valid,
      (val) => ({
        message: validateUserIDFormat(val).error || 'Invalid userID format',
      })
    ),
})

/**
 * Update user profile schema
 */
export const updateUserSchema = z.object({
  bio: z.string().max(USER_PROFILE.BIO_MAX_LENGTH, `Bio is too long (max ${USER_PROFILE.BIO_MAX_LENGTH} characters)`).optional(),
  backgroundImage: z.string().url('Invalid background image URL').optional().or(z.literal('')),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  name: z.string().max(USER_PROFILE.NAME_MAX_LENGTH, `Name is too long (max ${USER_PROFILE.NAME_MAX_LENGTH} characters)`).optional(),
})

/**
 * Lookup user schema
 */
export const lookupUserSchema = z.object({
  userID: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'UserID is required'),
})

