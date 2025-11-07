/**
 * Drafts API
 * Typed API methods for draft operations
 */

import { apiClient } from './client'
import { endpoints } from './endpoints'
import type { DraftResponse, DraftsResponse } from '@/types/api/responses'
import type { CreatePostRequest } from '@/types/api/requests'

/**
 * Get all drafts
 */
export async function getDrafts(): Promise<DraftsResponse> {
  return apiClient.get(endpoints.drafts.list)
}

/**
 * Create a draft
 */
export async function createDraft(
  data: CreatePostRequest
): Promise<DraftResponse> {
  return apiClient.post(endpoints.drafts.create, data)
}

/**
 * Update a draft
 */
export async function updateDraft(
  id: string,
  data: CreatePostRequest
): Promise<DraftResponse> {
  return apiClient.put(endpoints.drafts.update(id), data)
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(endpoints.drafts.delete(id))
}

