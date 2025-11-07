/**
 * Post Query Builders
 * Centralized Prisma query builders for posts and comments
 * 
 * Note: Comments are stored as Posts with parentId !== null
 */

import { prisma } from '@/lib/prisma'
import { postWithDetailsInclude } from '@/types/entities/post'
import type { PostWithDetails } from '@/types/entities/post'

/**
 * Find the root post (top-level post) by traversing up the parent chain
 */
export async function findRootPost(postId: string): Promise<string | null> {
  let currentId = postId
  let depth = 0
  const maxDepth = 100 // Prevent infinite loops

  while (depth < maxDepth) {
    const post = await prisma.post.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })

    if (!post) return null
    if (!post.parentId) return currentId // Found root post

    currentId = post.parentId
    depth++
  }

  return null // Max depth reached
}

/**
 * Get a post by ID with full details
 */
export async function getPostById(id: string): Promise<PostWithDetails | null> {
  return await prisma.post.findUnique({
    where: { id },
    include: postWithDetailsInclude,
  })
}

/**
 * Get top-level posts (posts without parentId)
 */
export async function getTopLevelPosts(options: {
  authorId?: string
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
} = {}) {
  const {
    authorId,
    limit = 50,
    offset = 0,
    orderBy = 'createdAt',
    order = 'desc',
  } = options

  return await prisma.post.findMany({
    where: {
      parentId: null, // Only top-level posts
      ...(authorId && { authorId }),
    },
    include: postWithDetailsInclude,
    take: limit,
    skip: offset,
    orderBy: {
      [orderBy]: order,
    },
  })
}

/**
 * Get replies to a post (posts with parentId = postId)
 */
export async function getPostReplies(
  postId: string,
  options: {
    limit?: number
    offset?: number
    orderBy?: 'createdAt' | 'updatedAt'
    order?: 'asc' | 'desc'
  } = {}
) {
  const {
    limit = 50,
    offset = 0,
    orderBy = 'createdAt',
    order = 'asc',
  } = options

  return await prisma.post.findMany({
    where: {
      parentId: postId,
    },
    include: postWithDetailsInclude,
    take: limit,
    skip: offset,
    orderBy: {
      [orderBy]: order,
    },
  })
}

/**
 * Recursively fetch all nested replies for a post
 */
export async function getPostRepliesRecursive(parentId: string): Promise<any[]> {
  const replies = await prisma.post.findMany({
    where: {
      parentId: parentId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
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
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Recursively fetch nested replies
  const repliesWithNested = await Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await getPostRepliesRecursive(reply.id)
      return {
        ...reply,
        replies: nestedReplies,
      }
    })
  )

  return repliesWithNested
}

/**
 * Create a new post
 */
export async function createPost(data: {
  authorId: string
  content: string
  parentId?: string | null
}): Promise<PostWithDetails> {
  return await prisma.post.create({
    data: {
      authorId: data.authorId,
      content: data.content.trim(),
      parentId: data.parentId || null,
    },
    include: postWithDetailsInclude,
  })
}

/**
 * Delete a post (cascade will delete replies)
 */
export async function deletePost(id: string): Promise<void> {
  await prisma.post.delete({
    where: { id },
  })
}

/**
 * Get post count (replies count for a post)
 */
export async function getPostReplyCount(postId: string): Promise<number> {
  return await prisma.post.count({
    where: { parentId: postId },
  })
}

/**
 * Check if a post is a top-level post (not a comment/reply)
 */
export function isTopLevelPost(post: { parentId: string | null }): boolean {
  return post.parentId === null
}

/**
 * Check if a post is a comment/reply
 */
export function isComment(post: { parentId: string | null }): boolean {
  return post.parentId !== null
}

