/**
 * Webhook API types
 */
import type { WebhookEvent } from '@line/bot-sdk';

export type { WebhookEvent };

/**
 * Webhook event types
 */
export type WebhookEventType = 'message' | 'follow' | 'unfollow' | 'join' | 'leave';

/**
 * Message event (text message)
 */
export type TextMessageEvent = WebhookEvent & {
  type: 'message';
  message: {
    type: 'text';
    id: string;
    text: string;
  };
};

/**
 * Follow event
 */
export type FollowEvent = WebhookEvent & {
  type: 'follow';
};

/**
 * Unfollow event
 */
export type UnfollowEvent = WebhookEvent & {
  type: 'unfollow';
};

