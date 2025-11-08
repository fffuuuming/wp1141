/**
 * Pusher Client-Side Configuration
 * Client-side Pusher setup and utilities
 */

'use client'

import PusherClient from 'pusher-js'
import { useEffect, useRef } from 'react'

// Global Pusher client instance
let pusherClientInstance: PusherClient | null = null

// Track channel subscriptions to avoid unsubscribing when other components are still using it
const channelSubscriptions = new Map<string, number>()

/**
 * Subscribe to a channel (with reference counting)
 */
function subscribeChannel(channelName: string) {
  const pusher = getPusherClient()
  if (!pusher) return null

  const count = channelSubscriptions.get(channelName) || 0
  channelSubscriptions.set(channelName, count + 1)

  const channel = pusher.subscribe(channelName)
  
  if (process.env.NODE_ENV === 'development' && count === 0) {
    console.log(`[Pusher] First subscription to channel "${channelName}"`)
  }

  return channel
}

/**
 * Unsubscribe from a channel (with reference counting)
 */
function unsubscribeChannel(channelName: string) {
  const pusher = getPusherClient()
  if (!pusher) return

  const count = channelSubscriptions.get(channelName) || 0
  
  if (count <= 1) {
    // Last subscriber, actually unsubscribe
    channelSubscriptions.delete(channelName)
    pusher.unsubscribe(channelName)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Pusher] Unsubscribed from channel "${channelName}" (last subscriber)`)
    }
  } else {
    // Still other subscribers, just decrement count
    channelSubscriptions.set(channelName, count - 1)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Pusher] Decremented subscription count for "${channelName}" (${count - 1} remaining)`)
    }
  }
}

/**
 * Get or create Pusher client instance
 * Returns null if credentials are not available
 */
export function getPusherClient(): PusherClient | null {
  // Return cached instance if available
  if (pusherClientInstance) {
    return pusherClientInstance
  }

  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null
  }

  // Get Pusher key and cluster from environment (exposed via Next.js public env vars)
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!key || !cluster) {
    console.warn('Pusher client credentials not configured. Real-time features will be disabled.')
    return null
  }

  // Create and cache Pusher client instance
  pusherClientInstance = new PusherClient(key, {
    cluster,
    forceTLS: true,
  })

  // Enable Pusher logging in development
  if (process.env.NODE_ENV === 'development') {
    pusherClientInstance.logToConsole = true
  }

  // Log connection events
  pusherClientInstance.connection.bind('connected', () => {
    console.log('✅ Pusher: Connected successfully')
  })

  pusherClientInstance.connection.bind('disconnected', () => {
    console.log('⚠️ Pusher: Disconnected')
  })

  pusherClientInstance.connection.bind('error', (err: any) => {
    console.error('❌ Pusher: Connection error', err)
  })

  pusherClientInstance.connection.bind('state_change', (states: any) => {
    console.log('🔄 Pusher: State changed', states.previous, '->', states.current)
  })

  return pusherClientInstance
}

/**
 * Hook to subscribe to a Pusher channel
 */
export function usePusherChannel(
  channelName: string,
  eventName: string,
  callback: (data: any) => void,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const channel = subscribeChannel(channelName)
    if (!channel) {
      return
    }

    // Log subscription events (only once per channel)
    const subscriptionHandler = () => {
      console.log(`✅ Pusher: Subscribed to channel "${channelName}"`)
      console.log(`[Pusher] Channel "${channelName}" is now ready to receive events`)
      console.log(`[Pusher] Listening for event "${eventName}" on channel "${channelName}"`)
    }
    channel.bind('pusher:subscription_succeeded', subscriptionHandler)

    const errorHandler = (status: number) => {
      console.error(`❌ Pusher: Subscription error for channel "${channelName}":`, status)
    }
    channel.bind('pusher:subscription_error', errorHandler)

    const handler = (data: any) => {
      // Always log received events in development (even before callback)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📨 Pusher: Received event "${eventName}" on channel "${channelName}":`, data)
        console.log(`[Pusher] Calling callback for event "${eventName}" on channel "${channelName}"`)
      }
      try {
        callbackRef.current(data)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Pusher] Callback executed successfully for event "${eventName}"`)
        }
      } catch (error) {
        console.error(`[Pusher] Error in callback for event "${eventName}":`, error)
      }
    }

    channel.bind(eventName, handler)

    return () => {
      channel.unbind(eventName, handler)
      // Only unbind subscription handlers if we're the last subscriber
      const count = channelSubscriptions.get(channelName) || 0
      if (count <= 1) {
        channel.unbind('pusher:subscription_succeeded', subscriptionHandler)
        channel.unbind('pusher:subscription_error', errorHandler)
      }
      unsubscribeChannel(channelName)
    }
  }, [channelName, eventName, enabled])
}

/**
 * Hook to subscribe to multiple events on a channel
 */
export function usePusherChannelEvents(
  channelName: string,
  events: Record<string, (data: any) => void>,
  enabled: boolean = true
) {
  const eventsRef = useRef(events)

  // Keep events ref up to date
  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const channel = subscribeChannel(channelName)
    if (!channel) {
      return
    }

    const handlers: Array<{ event: string; handler: (data: any) => void }> = []

    // Bind all events
    Object.entries(eventsRef.current).forEach(([eventName, callback]) => {
      const handler = (data: any) => {
        callback(data)
      }
      channel.bind(eventName, handler)
      handlers.push({ event: eventName, handler })
    })

    return () => {
      // Unbind all events
      handlers.forEach(({ event, handler }) => {
        channel.unbind(event, handler)
      })
      unsubscribeChannel(channelName)
    }
  }, [channelName, enabled])
}

