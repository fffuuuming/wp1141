/**
 * Post validation schemas
 * Zod schemas for post-related validation
 */

import { z } from 'zod'
import { POST_CONTENT, STRING_VALIDATION } from '@/lib/constants/validation'

/**
 * Create post schema
 */
export const createPostSchema = z.object({
  content: z
    .string()
    .min(STRING_VALIDATION.MIN_LENGTH, 'Post content cannot be empty')
    .max(POST_CONTENT.MAX_LENGTH, 'Post content is too long'), // Allow longer for validation, check char count separately
})

/**
 * Create comment/reply schema
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(STRING_VALIDATION.MIN_LENGTH, 'Comment content cannot be empty')
    .max(POST_CONTENT.MAX_LENGTH, 'Comment content is too long'),
  parentId: z.string().optional(),
})

