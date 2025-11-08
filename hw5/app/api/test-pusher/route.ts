/**
 * Test Pusher Broadcasting
 * Simple endpoint to test if Pusher broadcasting works
 */

import { NextRequest, NextResponse } from 'next/server'
import { broadcastEvent, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'
import { getPusher } from '@/lib/pusher'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId') || 'test-post-id'
  const testEvent = searchParams.get('event') || 'like'

  // Check if Pusher is configured
  const pusher = getPusher()
  if (!pusher) {
    return NextResponse.json({
      success: false,
      error: 'Pusher not configured',
      message: 'Check PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER in .env',
    }, { status: 500 })
  }

  // Try to broadcast a test event
  const channel = PUSHER_CHANNELS.post(postId)
  const event = testEvent === 'like' ? PUSHER_EVENTS.LIKE : PUSHER_EVENTS.COMMENT_CREATED
  
  const testData = {
    postId,
    userId: 'test-user',
    count: 999,
    test: true,
    timestamp: new Date().toISOString(),
  }

  try {
    const success = await broadcastEvent(channel, event, testData)
    
    return NextResponse.json({
      success,
      channel,
      event,
      data: testData,
      message: success 
        ? 'Event broadcasted successfully! Check your browser console for the event.'
        : 'Failed to broadcast event',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      channel,
      event,
    }, { status: 500 })
  }
}

