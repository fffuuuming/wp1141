/**
 * Post entity types
 * Centralized type definitions for post-related data structures
 */

import { UserBasic } from './user'

/**
 * Post counts (likes, replies, reposts)
 */
export interface PostCounts {
  likes: number
  replies: number
  reposts: number
}

/**
 * Base post structure
 */
export interface Post {
  id: string
  content: string
  createdAt: Date | string
  updatedAt?: Date | string
  authorId: string
  parentId?: string | null
}

/**
 * Post with author and counts (most common format)
 */
export interface PostWithDetails extends Post {
  author: UserBasic
  _count: PostCounts
}

/**
 * Post with parent (for replies)
 */
export interface PostWithParent extends PostWithDetails {
  parent: {
    id: string
    content: string
    createdAt: Date | string
    author: UserBasic
  } | null
}

/**
 * Post with nested replies
 */
export interface PostWithReplies extends PostWithDetails {
  replies?: PostWithReplies[]
}

/**
 * Post variant types for different display contexts
 */
export type PostVariant = 'home' | 'post' | 'comment'

/**
 * Post selection fields for Prisma queries
 */
export const postWithDetailsInclude = {
  author: {
    select: {
      id: true,
      userID: true,
      name: true,
      image: true,
    },
  },
  _count: {
    select: {
      likes: true,
      replies: true,
      reposts: true,
    },
  },
} as const

export const postWithParentInclude = {
  ...postWithDetailsInclude,
  parent: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
    },
  },
} as const

