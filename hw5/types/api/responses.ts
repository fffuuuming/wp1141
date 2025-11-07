/**
 * API response types
 * Standardized response formats for all API endpoints
 */

/**
 * Standard success response wrapper
 */
export interface ApiSuccessResponse<T = unknown> {
  success?: boolean
  data?: T
  [key: string]: unknown // Allow additional fields like 'post', 'user', etc.
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  error: string
  details?: string | Record<string, unknown>
}

/**
 * API response union type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Post API responses
 */
export interface PostResponse {
  post: import('../entities/post').PostWithDetails
}

export interface PostWithParentResponse {
  post: import('../entities/post').PostWithParent
}

export interface PostsResponse {
  posts: import('../entities/post').PostWithDetails[]
}

/**
 * Comment API responses
 */
export interface CommentResponse {
  comment: import('../entities/comment').CommentWithDetails
}

export interface CommentWithRepliesResponse {
  comment: import('../entities/comment').CommentWithReplies
}

export interface CommentsResponse {
  comments: import('../entities/comment').CommentWithDetails[]
}

/**
 * User API responses
 */
export interface UserResponse {
  user: import('../entities/user').UserProfile
  isFollowing?: boolean
  isOwnProfile?: boolean
}

export interface UsersResponse {
  users: import('../entities/user').UserProfile[]
}

/**
 * Interaction API responses
 */
export interface LikeResponse {
  liked: boolean
  count: number
}

export interface RepostResponse {
  reposted: boolean
  count: number
}

export interface FollowResponse {
  following: boolean
  count?: number
}

/**
 * Draft API responses
 */
export interface DraftResponse {
  draft: import('../entities/draft').DraftDisplay
}

export interface DraftsResponse {
  drafts: import('../entities/draft').DraftDisplay[]
}

/**
 * Feed API response
 */
export interface FeedResponse {
  posts: import('../entities/post').PostWithDetails[]
}

