/**
 * Post validation schemas
 * Zod schemas for post-related validation
 */

import { z } from 'zod'

/**
 * Create post schema
 */
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(10000, 'Post content is too long'), // Allow longer for validation, check char count separately
})

/**
 * Create comment/reply schema
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(10000, 'Comment content is too long'),
  parentId: z.string().optional(),
})

