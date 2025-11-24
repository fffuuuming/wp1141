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

/**
 * Send a buttons template message
 * @param replyToken - LINE reply token
 * @param text - Main text to display
 * @param buttons - Array of button labels (max 4 buttons)
 */
export async function sendButtonsTemplate(
  replyToken: string,
  text: string,
  buttons: Array<{ label: string; data: string }>
): Promise<void> {
  // LINE buttons template supports max 4 buttons
  const buttonsToSend = buttons.slice(0, 4);

  const template: Message = {
    type: 'template',
    altText: text,
    template: {
      type: 'buttons',
      text: text,
      actions: buttonsToSend.map((button) => ({
        type: 'postback',
        label: button.label,
        data: button.data,
        displayText: button.label,
      })),
    },
  };

  await replyMessage(replyToken, [template]);
}

/**
 * Send a carousel template message (for questions list)
 * @param replyToken - LINE reply token
 * @param items - Array of carousel items (max 10 items)
 */
export async function sendCarouselTemplate(
  replyToken: string,
  items: Array<{
    title: string;
    text: string;
    actions: Array<{ label: string; data: string }>;
  }>
): Promise<void> {
  // LINE carousel supports max 10 items
  const itemsToSend = items.slice(0, 10);

  const template: Message = {
    type: 'template',
    altText: '請選擇一個問題',
    template: {
      type: 'carousel',
      columns: itemsToSend.map((item) => ({
        title: item.title.length > 40 ? item.title.substring(0, 37) + '...' : item.title,
        text: item.text.length > 120 ? item.text.substring(0, 117) + '...' : item.text,
        actions: item.actions.map((action) => ({
          type: 'postback',
          label: action.label,
          data: action.data,
          displayText: action.label,
        })),
      })),
    },
  };

  await replyMessage(replyToken, [template]);
}

// Type exports
export type { WebhookEvent };

