/**
 * Feed API
 * Typed API methods for feed operations
 */

import { apiClient } from './client'
import { endpoints } from './endpoints'
import type { FeedResponse } from '@/types/api/responses'
import type { FeedQueryParams } from '@/types/api/requests'

/**
 * Get feed posts
 */
export async function getFeed(filter?: 'all' | 'following'): Promise<FeedResponse> {
  return apiClient.get(endpoints.feed.get(filter))
}

