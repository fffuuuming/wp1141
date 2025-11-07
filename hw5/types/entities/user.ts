/**
 * User entity types
 * Centralized type definitions for user-related data structures
 */

/**
 * Base user fields (from database)
 */
export interface User {
  id: string
  userID: string
  name: string | null
  email: string | null
  image: string | null
  bio: string | null
  backgroundImage: string | null
  createdAt: Date | string
  updatedAt?: Date | string
}

/**
 * User with counts (for profile pages)
 */
export interface UserWithCounts extends User {
  _count: {
    posts: number
    following: number
    followers: number
  }
}

/**
 * User stats (transformed from _count)
 */
export interface UserStats {
  posts: number
  following: number
  followers: number
}

/**
 * User profile (for display)
 */
export interface UserProfile extends User {
  stats: UserStats
}

/**
 * Minimal user info (for posts, comments, etc.)
 */
export interface UserBasic {
  id: string
  userID: string
  name: string | null
  image: string | null
}

/**
 * User selection fields for Prisma queries
 */
export const userBasicSelect = {
  id: true,
  userID: true,
  name: true,
  image: true,
} as const

export const userProfileSelect = {
  id: true,
  userID: true,
  name: true,
  email: true,
  image: true,
  bio: true,
  backgroundImage: true,
  createdAt: true,
} as const

