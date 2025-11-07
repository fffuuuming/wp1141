/**
 * User validation schemas
 * Zod schemas for user-related validation
 */

import { z } from 'zod'
import { validateUserIDFormat, USERID_MIN_LENGTH, USERID_MAX_LENGTH } from '@/lib/userID'

/**
 * Register userID schema
 */
export const registerUserIDSchema = z.object({
  userID: z
    .string()
    .min(USERID_MIN_LENGTH, `UserID must be at least ${USERID_MIN_LENGTH} characters`)
    .max(USERID_MAX_LENGTH, `UserID must be at most ${USERID_MAX_LENGTH} characters`)
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
  bio: z.string().max(500, 'Bio is too long').optional(),
  backgroundImage: z.string().url('Invalid background image URL').optional().or(z.literal('')),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  name: z.string().max(100, 'Name is too long').optional(),
})

/**
 * Lookup user schema
 */
export const lookupUserSchema = z.object({
  userID: z.string().min(1, 'UserID is required'),
})

