import { NextRequest, NextResponse } from 'next/server';
import { type WebhookEvent } from '@/lib/services/lineService';
import { config } from '@/lib/config';
import { processMessage, processPostback } from '@/lib/services/messageService';
import {
  handleFollowEvent,
  handleUnfollowEvent,
} from '@/lib/services/botLogicService';
import { logger } from '@/lib/utils/logger';
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

  if (!config.LINE_CHANNEL_SECRET) {
    logger.error('LINE_CHANNEL_SECRET is not configured');
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', config.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  return hash === signature;
}

// Force dynamic rendering - this route handles webhook requests and uses request bodies
export const dynamic = 'force-dynamic';

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
      logger.warn('Invalid webhook signature', { signature: signature?.substring(0, 10) });
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Invalid signature' } },
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
          logger.error('Error processing message asynchronously', error, {
            eventType: event.type,
            userId: event.source.userId,
          });
        });
      } else if (event.type === 'postback') {
        // Handle postback event (button click)
        // Don't await - process in background to respond quickly
        processPostback(event).catch((error) => {
          logger.error('Error processing postback asynchronously', error, {
            eventType: event.type,
            userId: event.source.userId,
          });
        });
      } else if (event.type === 'follow') {
        // User followed the bot - send welcome message
        const userId = event.source.userId;
        if (userId && event.replyToken) {
          // Process asynchronously
          handleFollowEvent(userId, event.replyToken).catch((error) => {
            logger.error('Error handling follow event asynchronously', error, { userId });
          });
        }
      } else if (event.type === 'unfollow') {
        // User unfollowed the bot - mark conversations as inactive
        const userId = event.source.userId;
        if (userId) {
          // Process asynchronously
          handleUnfollowEvent(userId).catch((error) => {
            logger.error('Error handling unfollow event asynchronously', error, { userId });
          });
        }
      }
    }

    // Return 200 OK immediately to acknowledge receipt
    // This prevents LINE from sending auto-reply messages
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook handler error', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook verification and health check
 * GET /api/webhook
 * 
 * This endpoint serves two purposes:
 * 1. Line webhook verification (Line requires this endpoint)
 * 2. Health check for webhook service
 */
export async function GET() {
  try {
    // Check if Line credentials are configured
    const lineConfigured =
      !!config.LINE_CHANNEL_SECRET && !!config.LINE_CHANNEL_ACCESS_TOKEN;

    // Basic health check response
    const healthData = {
      success: true,
      service: 'line-webhook',
      status: lineConfigured ? 'ready' : 'not_configured',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Line webhook endpoint is active',
        lineConfigured,
        ...(lineConfigured
          ? {
              channelSecretConfigured: !!config.LINE_CHANNEL_SECRET,
              accessTokenConfigured: !!config.LINE_CHANNEL_ACCESS_TOKEN,
            }
          : {
              warning: 'Line credentials not configured. Webhook will not process events.',
            }),
      },
    };

    // Return 200 OK even if not configured (for Line verification)
    // But include status information for monitoring
    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    logger.error('Webhook health check error', error);
    return NextResponse.json(
      {
        success: false,
        service: 'line-webhook',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}

