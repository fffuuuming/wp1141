/**
 * Pusher Server-Side Configuration
 * Singleton instance for server-side Pusher operations
 */

import Pusher from 'pusher'

// Initialize Pusher only if credentials are available
let pusherInstance: Pusher | null = null

/**
 * Get or create Pusher instance
 * Returns null if credentials are not configured
 */
export function getPusher(): Pusher | null {
  // Return cached instance if available
  if (pusherInstance) {
    return pusherInstance
  }

  // Check if Pusher credentials are configured
  const appId = process.env.PUSHER_APP_ID
  const key = process.env.PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER

  if (!appId || !key || !secret || !cluster) {
    console.warn('Pusher credentials not configured. Real-time features will be disabled.')
    return null
  }

  // Create and cache Pusher instance
  pusherInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  })

  return pusherInstance
}

/**
 * Broadcast an event to a channel
 */
export async function broadcastEvent(
  channel: string,
  event: string,
  data: any
): Promise<boolean> {
  const pusher = getPusher()
  
  if (!pusher) {
    // Log warning if Pusher is not configured
    console.warn(`⚠️ Pusher: Cannot broadcast event "${event}" to channel "${channel}" - Pusher not configured`)
    return false
  }

  try {
    await pusher.trigger(channel, event, data)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 Pusher: Successfully broadcasted event "${event}" to channel "${channel}":`, data)
    }
    return true
  } catch (error: any) {
    console.error('❌ Pusher: Error broadcasting event:', {
      channel,
      event,
      error: error?.message || error,
      stack: error?.stack,
    })
    return false
  }
}

/**
 * Channel names for different event types
 */
export const PUSHER_CHANNELS = {
  // Post-specific channels
  post: (postId: string) => `post-${postId}`,
  // Comment-specific channels
  comment: (commentId: string) => `comment-${commentId}`,
  // User-specific channels
  user: (userID: string) => `user-${userID}`,
  // Global feed channel
  feed: 'feed',
} as const

/**
 * Event names for different actions
 */
export const PUSHER_EVENTS = {
  // Like events
  LIKE: 'like',
  UNLIKE: 'unlike',
  // Comment events
  COMMENT_CREATED: 'comment-created',
  COMMENT_DELETED: 'comment-deleted',
  // Post events
  POST_CREATED: 'post-created',
  POST_DELETED: 'post-deleted',
  // Repost events
  REPOST: 'repost',
  UNREPOST: 'unrepost',
  // Follow events
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow',
} as const

