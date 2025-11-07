/**
 * Draft validation schemas
 * Zod schemas for draft-related validation
 */

import { z } from 'zod'

/**
 * Create/update draft schema
 */
export const draftSchema = z.object({
  content: z.string().max(10000, 'Draft content is too long'),
})

