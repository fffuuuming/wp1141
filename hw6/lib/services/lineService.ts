import { Client, middleware, MiddlewareConfig, WebhookEvent } from '@line/bot-sdk';
import { config } from '@/lib/config';

// Line Bot Client configuration
const clientConfig = {
  channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
};

// Create Line Bot client
export const lineClient = new Client(clientConfig);

// Middleware configuration
export const middlewareConfig: MiddlewareConfig = {
  channelSecret: config.LINE_CHANNEL_SECRET,
};

// Create middleware for webhook signature verification
export const lineMiddleware = middleware(middlewareConfig);

// Helper function to reply to user
export async function replyMessage(
  replyToken: string,
  messages: Array<{ type: string; text?: string }>
): Promise<void> {
  try {
    // Line SDK replyMessage expects (replyToken, messages)
    await (lineClient.replyMessage as any)(replyToken, messages);
  } catch (error) {
    console.error('Error replying message:', error);
    throw error;
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
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Type exports
export type { WebhookEvent };

