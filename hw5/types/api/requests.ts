/**
 * API request types
 * Type definitions for request bodies and query parameters
 */

/**
 * Create post request
 */
export interface CreatePostRequest {
  content: string
}

/**
 * Create comment/reply request
 */
export interface CreateCommentRequest {
  content: string
  parentId?: string
}

/**
 * Update user profile request
 */
export interface UpdateUserRequest {
  bio?: string
  backgroundImage?: string
  image?: string
  name?: string
}

/**
 * Register userID request
 */
export interface RegisterUserIDRequest {
  userID: string
}

/**
 * Lookup user request
 */
export interface LookupUserRequest {
  userID: string
}

/**
 * Feed query parameters
 */
export interface FeedQueryParams {
  filter?: 'all' | 'following'
  limit?: number
  offset?: number
}

/**
 * User posts query parameters
 */
export interface UserPostsQueryParams {
  limit?: number
  offset?: number
}

