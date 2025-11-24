/**
 * Common API types shared across multiple endpoints
 */

/**
 * Pagination info
 */
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

