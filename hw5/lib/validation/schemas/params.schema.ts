/**
 * Route parameter validation schemas
 * Zod schemas for validating route parameters
 */

import { z } from 'zod'
import { STRING_VALIDATION } from '@/lib/constants/validation'

/**
 * Post ID parameter
 */
export const postIdSchema = z.object({
  id: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'Post ID is required'),
})

/**
 * Comment ID parameter
 */
export const commentIdSchema = z.object({
  id: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'Comment ID is required'),
})

/**
 * User ID parameter
 */
export const userIdSchema = z.object({
  userID: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'UserID is required'),
})

/**
 * Draft ID parameter
 */
export const draftIdSchema = z.object({
  id: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'Draft ID is required'),
})

/**
 * Feed query parameters
 */
export const feedQuerySchema = z.object({
  filter: z.enum(['all', 'following']).optional().default('all'),
})

/**
 * User ID parameter (database ID, not userID)
 */
export const userIdParamSchema = z.object({
  userId: z.string().min(STRING_VALIDATION.MIN_LENGTH, 'User ID is required'),
})

