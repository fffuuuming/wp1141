import { Client, middleware, MiddlewareConfig, WebhookEvent, Message } from '@line/bot-sdk';
import { config } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import { LineAPIError } from '@/lib/errors';
import type { ReplyMessageFunction } from '@/types/line';

// Validate LINE credentials are available
function validateLineCredentials() {
  if (!config.LINE_CHANNEL_ACCESS_TOKEN || !config.LINE_CHANNEL_SECRET) {
    throw new Error(
      'LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET are required for LINE service operations'
    );
  }
}

// Line Bot Client configuration
function getClientConfig() {
  validateLineCredentials();
  return {
    channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: config.LINE_CHANNEL_SECRET!,
  };
}

// Create Line Bot client (lazy initialization)
let _lineClient: Client | null = null;
function getLineClient(): Client {
  if (!_lineClient) {
    _lineClient = new Client(getClientConfig());
  }
  return _lineClient;
}

// Export lineClient with lazy initialization
export const lineClient = new Proxy({} as Client, {
  get(_target, prop) {
    return getLineClient()[prop as keyof Client];
  },
});

// Middleware configuration
function getMiddlewareConfig(): MiddlewareConfig {
  validateLineCredentials();
  return {
    channelSecret: config.LINE_CHANNEL_SECRET!,
  };
}

// Export middlewareConfig with lazy initialization
export const middlewareConfig = new Proxy({} as MiddlewareConfig, {
  get(_target, prop) {
    return getMiddlewareConfig()[prop as keyof MiddlewareConfig];
  },
});

// Create middleware for webhook signature verification (lazy initialization)
let _lineMiddleware: ReturnType<typeof middleware> | null = null;
function getLineMiddleware() {
  if (!_lineMiddleware) {
    _lineMiddleware = middleware(getMiddlewareConfig());
  }
  return _lineMiddleware;
}

// Export lineMiddleware with lazy initialization
export const lineMiddleware = new Proxy({} as ReturnType<typeof middleware>, {
  get(_target, prop) {
    return getLineMiddleware()[prop as keyof ReturnType<typeof middleware>];
  },
});

// Helper function to reply to user
export async function replyMessage(
  replyToken: string,
  messages: Message[]
): Promise<void> {
  try {
    // Line SDK replyMessage expects (replyToken, messages)
    // Type assertion needed due to SDK type definition issues
    // We ignore the return value (MessageAPIResponseBase)
    await (lineClient.replyMessage as unknown as ReplyMessageFunction)(
      replyToken,
      messages
    );
  } catch (error) {
    logger.error('Error replying message', error, { replyToken: replyToken.substring(0, 10) });
    throw new LineAPIError('Failed to reply message', 500, { originalError: error });
  }
}

// Helper function to send text message
export async function sendTextMessage(
  replyToken: string,
  text: string
): Promise<void> {
  await replyMessage(replyToken, [
    {
      type: 'text',
      text: text,
    },
  ]);
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const profile = await lineClient.getProfile(userId);
    return profile;
  } catch (error) {
    logger.error('Error getting user profile', error, { userId });
    return null;
  }
}

// Type exports
export type { WebhookEvent };

