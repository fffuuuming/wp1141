/**
 * Posts API
 * Typed API methods for post operations
 */

import { apiClient } from './client'
import { endpoints } from './endpoints'
import type {
  PostResponse,
  PostWithParentResponse,
  PostsResponse,
  LikeResponse,
  RepostResponse,
  CommentsResponse,
} from '@/types/api/responses'
import type { CreatePostRequest, CreateCommentRequest } from '@/types/api/requests'

/**
 * Get a single post by ID
 */
export async function getPost(id: string): Promise<PostWithParentResponse> {
  return apiClient.get(endpoints.posts.get(id))
}

/**
 * Create a new post
 */
export async function createPost(
  data: CreatePostRequest
): Promise<PostResponse> {
  return apiClient.post(endpoints.posts.create, data)
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(endpoints.posts.delete(id))
}

/**
 * Like a post
 */
export async function likePost(id: string): Promise<LikeResponse> {
  return apiClient.post(endpoints.posts.like(id))
}

/**
 * Check if post is liked
 */
export async function isPostLiked(id: string): Promise<{ liked: boolean }> {
  return apiClient.get(endpoints.posts.liked(id))
}

/**
 * Repost a post
 */
export async function repostPost(id: string): Promise<RepostResponse> {
  return apiClient.post(endpoints.posts.repost(id))
}

/**
 * Check if post is reposted
 */
export async function isPostReposted(id: string): Promise<{ reposted: boolean }> {
  return apiClient.get(endpoints.posts.reposted(id))
}

/**
 * Get post comments
 */
export async function getPostComments(id: string): Promise<CommentsResponse> {
  return apiClient.get(endpoints.posts.comments(id))
}

/**
 * Create a reply (comment) on a post
 */
export async function createPostReply(
  postId: string,
  data: CreateCommentRequest
): Promise<PostResponse & { count: number }> {
  return apiClient.post(endpoints.posts.comments(postId), data)
}

