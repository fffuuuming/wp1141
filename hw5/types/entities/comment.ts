/**
 * Comment entity types
 * Centralized type definitions for comment-related data structures
 */

import { UserBasic } from './user'

/**
 * Comment counts (likes, replies)
 */
export interface CommentCounts {
  likes: number
  replies: number
}

/**
 * Base comment structure
 */
export interface Comment {
  id: string
  content: string
  createdAt: Date | string
  updatedAt?: Date | string
  authorId: string
  postId: string
  parentId: string | null
}

/**
 * Comment with author and counts
 */
export interface CommentWithDetails extends Comment {
  author: UserBasic
  _count: CommentCounts
}

/**
 * Comment with post reference
 */
export interface CommentWithPost extends CommentWithDetails {
  post: {
    id: string
    content: string
    createdAt: Date | string
    author: UserBasic
    _count: {
      likes: number
      replies: number
      reposts: number
    }
  }
}

/**
 * Comment with parent reference
 */
export interface CommentWithParent extends CommentWithDetails {
  parent: {
    id: string
    content: string
    author: UserBasic
  } | null
}

/**
 * Comment with nested replies
 */
export interface CommentWithReplies extends CommentWithDetails {
  replies?: CommentWithReplies[]
}

/**
 * Comment selection fields for Prisma queries
 */
export const commentWithDetailsInclude = {
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
    },
  },
} as const

