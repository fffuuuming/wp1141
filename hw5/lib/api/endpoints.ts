/**
 * API Endpoints
 * Centralized endpoint definitions with type safety
 */

/**
 * API endpoint paths
 */
export const endpoints = {
  // Posts
  posts: {
    list: '/api/posts',
    create: '/api/posts',
    get: (id: string) => `/api/posts/${id}`,
    delete: (id: string) => `/api/posts/${id}`,
    like: (id: string) => `/api/posts/${id}/like`,
    liked: (id: string) => `/api/posts/${id}/liked`,
    repost: (id: string) => `/api/posts/${id}/repost`,
    reposted: (id: string) => `/api/posts/${id}/reposted`,
    comments: (id: string) => `/api/posts/${id}/comments`,
  },

  // Comments
  comments: {
    get: (id: string) => `/api/comments/${id}`,
    delete: (id: string) => `/api/comments/${id}`,
    replies: (id: string) => `/api/comments/${id}/replies`,
  },

  // Users
  users: {
    get: (userID: string) => `/api/user/${userID}`,
    update: (userID: string) => `/api/user/${userID}`,
    follow: (userID: string) => `/api/user/${userID}/follow`,
    unfollow: (userID: string) => `/api/user/${userID}/follow`,
    posts: (userID: string) => `/api/user/${userID}/posts`,
    likes: (userID: string) => `/api/user/${userID}/likes`,
    followers: (userID: string) => `/api/user/${userID}/followers`,
    following: (userID: string) => `/api/user/${userID}/following`,
    lookup: '/api/user/lookup',
    list: '/api/user/list',
    search: (query: string, limit?: number) => `/api/user/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`,
    recommendations: '/api/user/recommendations',
    delete: '/api/user/delete',
  },

  // Feed
  feed: {
    get: (filter?: 'all' | 'following') => 
      `/api/feed${filter ? `?filter=${filter}` : ''}`,
  },

  // Drafts
  drafts: {
    list: '/api/drafts',
    create: '/api/drafts',
    update: (id: string) => `/api/drafts/${id}`,
    delete: (id: string) => `/api/drafts/${id}`,
  },

  // Auth
  auth: {
    registerUserID: '/api/auth/register-userid',
  },
} as const

