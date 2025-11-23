import { NextRequest, NextResponse } from 'next/server';
import { type WebhookEvent } from '@/lib/services/lineService';
import { config } from '@/lib/config';
import { processMessage } from '@/lib/services/messageService';
import {
  handleFollowEvent,
  handleUnfollowEvent,
} from '@/lib/services/botLogicService';
import crypto from 'crypto';

/**
 * Verify Line webhook signature
 */
function verifySignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) {
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', config.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  return hash === signature;
}

/**
 * Line Webhook endpoint
 * POST /api/webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook events
    const events: WebhookEvent[] = JSON.parse(body).events || [];

    // Process each event asynchronously (don't await to respond quickly)
    // This prevents LINE from sending auto-reply messages
    for (const event of events) {
      // Handle different event types
      if (event.type === 'message' && event.message.type === 'text') {
        // Process message and generate reply asynchronously
        // Don't await - process in background to respond quickly
        processMessage(event).catch((error) => {
          console.error('Error processing message asynchronously:', error);
        });
      } else if (event.type === 'follow') {
        // User followed the bot - send welcome message
        const userId = event.source.userId;
        if (userId && event.replyToken) {
          // Process asynchronously
          handleFollowEvent(userId, event.replyToken).catch((error) => {
            console.error('Error handling follow event asynchronously:', error);
          });
        }
      } else if (event.type === 'unfollow') {
        // User unfollowed the bot - mark conversations as inactive
        const userId = event.source.userId;
        if (userId) {
          // Process asynchronously
          handleUnfollowEvent(userId).catch((error) => {
            console.error('Error handling unfollow event asynchronously:', error);
          });
        }
      }
    }

    // Return 200 OK immediately to acknowledge receipt
    // This prevents LINE from sending auto-reply messages
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook verification (Line requires this)
 * GET /api/webhook
 */
export async function GET() {
  return NextResponse.json(
    { message: 'Line webhook endpoint is active' },
    { status: 200 }
  );
}

