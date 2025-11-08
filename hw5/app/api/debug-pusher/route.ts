/**
 * Debug Pusher Subscription
 * Check if a channel is subscribed and test broadcasting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPusher, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  const pusher = getPusher()
  if (!pusher) {
    return NextResponse.json({ error: 'Pusher not configured' }, { status: 500 })
  }

  const channel = PUSHER_CHANNELS.post(postId)

  // Try to get channel info (Pusher doesn't expose this directly, but we can try to trigger)
  try {
    // Send a test event
    await pusher.trigger(channel, 'test-event', {
      message: 'Test event',
      timestamp: new Date().toISOString(),
      postId,
    })

    return NextResponse.json({
      success: true,
      channel,
      postId,
      message: 'Test event sent. Check browser console for reception.',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      channel,
      postId,
    }, { status: 500 })
  }
}

