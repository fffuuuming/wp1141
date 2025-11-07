/**
 * Route parameter validation schemas
 * Zod schemas for validating route parameters
 */

import { z } from 'zod'

/**
 * Post ID parameter
 */
export const postIdSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
})

/**
 * Comment ID parameter
 */
export const commentIdSchema = z.object({
  id: z.string().min(1, 'Comment ID is required'),
})

/**
 * User ID parameter
 */
export const userIdSchema = z.object({
  userID: z.string().min(1, 'UserID is required'),
})

/**
 * Draft ID parameter
 */
export const draftIdSchema = z.object({
  id: z.string().min(1, 'Draft ID is required'),
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
  userId: z.string().min(1, 'User ID is required'),
})

