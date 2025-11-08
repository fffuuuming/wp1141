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
      {
        message: 'Invalid userID format',
      }
    ),
})

/**
 * Update user profile schema
 */
export const updateUserSchema = z.object({
  bio: z.union([
    z.string().max(USER_PROFILE.BIO_MAX_LENGTH, `Bio is too long (max ${USER_PROFILE.BIO_MAX_LENGTH} characters)`),
    z.literal(''),
    z.null(),
  ]).optional(),
  backgroundImage: z
    .union([z.string(), z.literal(''), z.null()])
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Invalid background image URL',
    })
    .transform((val) => val === '' ? null : val),
  image: z
    .union([z.string(), z.literal(''), z.null()])
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Invalid image URL',
    })
    .transform((val) => val === '' ? null : val),
  name: z.union([
    z.string().max(USER_PROFILE.NAME_MAX_LENGTH, `Name is too long (max ${USER_PROFILE.NAME_MAX_LENGTH} characters)`),
    z.literal(''),
    z.null(),
  ]).optional(),
})

/**
 * Lookup user schema
 */
export const lookupUserSchema = z.object({
  userID: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'UserID is required'),
})

