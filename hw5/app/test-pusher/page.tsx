/**
 * Pusher Test Page
 * Simple page to test Pusher connection and events
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getPusherClient } from '@/lib/pusher-client'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

export default function TestPusherPage() {
  const { data: session } = useSession()
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...')
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([])
  const [receivedEvents, setReceivedEvents] = useState<Array<{ time: string; event: string; data: any }>>([])
  const [testPostId, setTestPostId] = useState<string>('test-post-id')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const pusher = getPusherClient()
    
    if (!pusher) {
      setConnectionStatus('❌ Pusher client not initialized (check NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER)')
      return
    }

    // Check connection state
    const updateStatus = () => {
      const state = pusher.connection.state
      setConnectionStatus(state === 'connected' ? '✅ Connected' : `⏳ ${state}`)
    }

    updateStatus()

    // Listen for connection events
    pusher.connection.bind('connected', () => {
      setConnectionStatus('✅ Connected')
    })

    pusher.connection.bind('disconnected', () => {
      setConnectionStatus('⚠️ Disconnected')
    })

    pusher.connection.bind('error', () => {
      setConnectionStatus('❌ Connection Error')
    })

    // Subscribe to a test channel
    const testChannel = pusher.subscribe('test-channel')
    
    testChannel.bind('pusher:subscription_succeeded', () => {
      setSubscribedChannels(prev => [...prev, 'test-channel'])
    })

    // Listen for test events
    testChannel.bind('test-event', (data: any) => {
      setReceivedEvents(prev => [
        {
          time: new Date().toLocaleTimeString(),
          event: 'test-event',
          data,
        },
        ...prev.slice(0, 9), // Keep last 10 events
      ])
    })

    // Also listen to a post channel if we have a session
    if (session?.user?.id) {
      // Subscribe to a dummy post channel for testing
      const postChannel = pusher.subscribe(PUSHER_CHANNELS.post('test-post-id'))
      
      postChannel.bind('pusher:subscription_succeeded', () => {
        setSubscribedChannels(prev => [...prev, 'post-test-post-id'])
      })

      // Listen for like events
      postChannel.bind(PUSHER_EVENTS.LIKE, (data: any) => {
        setReceivedEvents(prev => [
          {
            time: new Date().toLocaleTimeString(),
            event: PUSHER_EVENTS.LIKE,
            data,
          },
          ...prev.slice(0, 9),
        ])
      })

      // Listen for comment events
      postChannel.bind(PUSHER_EVENTS.COMMENT_CREATED, (data: any) => {
        setReceivedEvents(prev => [
          {
            time: new Date().toLocaleTimeString(),
            event: PUSHER_EVENTS.COMMENT_CREATED,
            data,
          },
          ...prev.slice(0, 9),
        ])
      })
    }

    return () => {
      pusher.unsubscribe('test-channel')
      if (session?.user?.id) {
        pusher.unsubscribe(PUSHER_CHANNELS.post('test-post-id'))
      }
    }
  }, [session])

  const testBroadcast = async () => {
    setTesting(true)
    try {
      const response = await fetch(`/api/test-pusher?postId=${testPostId}&event=like`)
      const result = await response.json()
      
      if (result.success) {
        alert('Test broadcast sent! Check if you received the event below.')
      } else {
        alert(`Failed to broadcast: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('Error testing broadcast:', error)
      alert('Error testing broadcast')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pusher Connection Test</h1>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <p className="text-lg">{connectionStatus}</p>
          {!session && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Note: Log in to test post-specific channels
            </p>
          )}
        </div>

        {/* Subscribed Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Subscribed Channels</h2>
          {subscribedChannels.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No channels subscribed yet...</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {subscribedChannels.map((channel) => (
                <li key={channel} className="text-sm font-mono">{channel}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Received Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Received Events (Last 10)</h2>
          {receivedEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No events received yet. Try liking a post or creating a comment in another window!
            </p>
          ) : (
            <div className="space-y-2">
              {receivedEvents.map((event, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{event.time}</span>
                    <span className="text-sm font-semibold">{event.event}</span>
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Broadcast Button */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold mb-2">Test Broadcast</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Post ID to test:</label>
              <input
                type="text"
                value={testPostId}
                onChange={(e) => setTestPostId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="test-post-id"
              />
            </div>
            <button
              onClick={testBroadcast}
              disabled={testing}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Send Test Broadcast'}
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This will send a test event from the server. Make sure you're subscribed to the channel above.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold mb-2">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open this page in one browser window</li>
            <li>Open your app in another window (or incognito mode)</li>
            <li>Log in as a different user in the second window</li>
            <li>Like a post or create a comment in the second window</li>
            <li>Watch the events appear here in real-time!</li>
            <li>Or use the "Test Broadcast" button above to send a test event</li>
          </ol>
        </div>

        {/* Environment Check */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-lg font-semibold mb-2">Environment Variables Check</h2>
          <div className="space-y-1 text-sm">
            <p>
              <strong>NEXT_PUBLIC_PUSHER_KEY:</strong>{' '}
              {process.env.NEXT_PUBLIC_PUSHER_KEY ? '✅ Set' : '❌ Missing'}
            </p>
            <p>
              <strong>NEXT_PUBLIC_PUSHER_CLUSTER:</strong>{' '}
              {process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? '✅ Set' : '❌ Missing'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Note: Server-side variables (PUSHER_APP_ID, PUSHER_SECRET) are not shown here for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

