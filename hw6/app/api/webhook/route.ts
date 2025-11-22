import { NextRequest, NextResponse } from 'next/server';
import { type WebhookEvent } from '@/lib/services/lineService';
import { config } from '@/lib/config';
import { processMessage } from '@/lib/services/messageService';
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

    // Process each event
    for (const event of events) {
      // Handle different event types
      if (event.type === 'message' && event.message.type === 'text') {
        // Process message and generate reply
        await processMessage(event);
      } else if (event.type === 'follow') {
        // User followed the bot
        console.log('User followed:', event.source.userId);
        // TODO: Send welcome message
      } else if (event.type === 'unfollow') {
        // User unfollowed the bot
        console.log('User unfollowed:', event.source.userId);
        // TODO: Mark conversation as inactive
      }
    }

    // Return 200 OK to acknowledge receipt
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

