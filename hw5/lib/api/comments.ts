/**
 * Comments API
 * Typed API methods for comment operations
 */

import { apiClient } from './client'
import { endpoints } from './endpoints'
import type {
  CommentResponse,
  CommentWithRepliesResponse,
  CommentsResponse,
} from '@/types/api/responses'
import type { CreateCommentRequest } from '@/types/api/requests'

/**
 * Get a single comment by ID
 */
export async function getComment(id: string): Promise<CommentWithRepliesResponse> {
  return apiClient.get(endpoints.comments.get(id))
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(endpoints.comments.delete(id))
}

/**
 * Create a reply to a comment
 */
export async function createCommentReply(
  commentId: string,
  data: CreateCommentRequest
): Promise<CommentResponse & { count: number }> {
  return apiClient.post(endpoints.comments.replies(commentId), data)
}

