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
 * Waits for connection to be ready before subscribing
 */
function subscribeChannel(channelName: string): Promise<ReturnType<typeof PusherClient.prototype.subscribe> | null> {
  return new Promise((resolve) => {
    const pusher = getPusherClient()
    if (!pusher) {
      resolve(null)
      return
    }

    const count = channelSubscriptions.get(channelName) || 0
    channelSubscriptions.set(channelName, count + 1)

    // Check if already connected
    if (pusher.connection.state === 'connected') {
      const channel = pusher.subscribe(channelName)
      if (process.env.NODE_ENV === 'development' && count === 0) {
        console.log(`[Pusher] First subscription to channel "${channelName}"`)
      }
      resolve(channel)
      return
    }

    // Wait for connection to be ready
    const connectionState = pusher.connection.state
    if (connectionState === 'connecting' || connectionState === 'unavailable') {
      // Wait for connection
      const onConnected = () => {
        pusher.connection.unbind('connected', onConnected)
        pusher.connection.unbind('error', onError)
        const channel = pusher.subscribe(channelName)
        if (process.env.NODE_ENV === 'development' && count === 0) {
          console.log(`[Pusher] First subscription to channel "${channelName}" (after connection)`)
        }
        resolve(channel)
      }

      const onError = () => {
        pusher.connection.unbind('connected', onConnected)
        pusher.connection.unbind('error', onError)
        console.error(`[Pusher] Connection error while waiting to subscribe to "${channelName}"`)
        resolve(null)
      }

      pusher.connection.bind('connected', onConnected)
      pusher.connection.bind('error', onError)

      // If already connected but state hasn't updated yet, try subscribing immediately
      // This handles race conditions
      setTimeout(() => {
        if (pusher.connection.state === 'connected') {
          pusher.connection.unbind('connected', onConnected)
          pusher.connection.unbind('error', onError)
          const channel = pusher.subscribe(channelName)
          if (process.env.NODE_ENV === 'development' && count === 0) {
            console.log(`[Pusher] First subscription to channel "${channelName}" (timeout check)`)
          }
          resolve(channel)
        }
      }, 100)
    } else {
      // Connection failed or disconnected, try subscribing anyway (Pusher will handle it)
      const channel = pusher.subscribe(channelName)
      if (process.env.NODE_ENV === 'development' && count === 0) {
        console.log(`[Pusher] First subscription to channel "${channelName}" (connection state: ${connectionState})`)
      }
      resolve(channel)
    }
  })
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
    PusherClient.logToConsole = true
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
    if (!enabled || !channelName) {
      return
    }

    let channel: ReturnType<typeof PusherClient.prototype.subscribe> | null = null
    let isMounted = true
    let subscriptionHandler: (() => void) | null = null
    let errorHandler: ((status: number) => void) | null = null
    let eventHandler: ((data: any) => void) | null = null

    // Subscribe to channel (async, waits for connection)
    subscribeChannel(channelName).then((subscribedChannel) => {
      if (!isMounted || !subscribedChannel) {
        return
      }

      channel = subscribedChannel

      // Log subscription events (only once per channel)
      subscriptionHandler = () => {
        console.log(`✅ Pusher: Subscribed to channel "${channelName}"`)
        console.log(`[Pusher] Channel "${channelName}" is now ready to receive events`)
        console.log(`[Pusher] Listening for event "${eventName}" on channel "${channelName}"`)
      }
      channel.bind('pusher:subscription_succeeded', subscriptionHandler)

      errorHandler = (status: number) => {
        console.error(`❌ Pusher: Subscription error for channel "${channelName}":`, status)
      }
      channel.bind('pusher:subscription_error', errorHandler)

      eventHandler = (data: any) => {
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

      channel.bind(eventName, eventHandler)
    })

    return () => {
      isMounted = false
      if (channel) {
        if (eventHandler) {
          channel.unbind(eventName, eventHandler)
        }
        // Only unbind subscription handlers if we're the last subscriber
        const count = channelSubscriptions.get(channelName) || 0
        if (count <= 1) {
          if (subscriptionHandler) {
            channel.unbind('pusher:subscription_succeeded', subscriptionHandler)
          }
          if (errorHandler) {
            channel.unbind('pusher:subscription_error', errorHandler)
          }
        }
        unsubscribeChannel(channelName)
      }
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
    if (!enabled || !channelName) {
      return
    }

    let channel: ReturnType<typeof PusherClient.prototype.subscribe> | null = null
    let isMounted = true
    const handlers: Array<{ event: string; handler: (data: any) => void }> = []

    // Subscribe to channel (async, waits for connection)
    subscribeChannel(channelName).then((subscribedChannel) => {
      if (!isMounted || !subscribedChannel) {
        return
      }

      channel = subscribedChannel

      // Bind all events
      Object.entries(eventsRef.current).forEach(([eventName, callback]) => {
        const handler = (data: any) => {
          callback(data)
        }
        channel!.bind(eventName, handler)
        handlers.push({ event: eventName, handler })
      })
    })

    return () => {
      isMounted = false
      if (channel) {
        // Unbind all events
        handlers.forEach(({ event, handler }) => {
          channel!.unbind(event, handler)
        })
        unsubscribeChannel(channelName)
      }
    }
  }, [channelName, enabled])
}

