/**
 * Draft entity types
 * Centralized type definitions for draft-related data structures
 */

/**
 * Base draft structure
 */
export interface Draft {
  id: string
  userId: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Draft for display (without userId)
 */
export interface DraftDisplay {
  id: string
  content: string
  updatedAt: Date | string
}

