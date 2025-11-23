import type { Message } from '@line/bot-sdk';

/**
 * Line Bot SDK type extensions
 * Fixes type issues with Line SDK
 */

/**
 * Reply message request type
 */
export interface ReplyMessageRequest {
  replyToken: string;
  messages: Message[];
}

/**
 * Type-safe wrapper for Line Client replyMessage
 * Note: Line SDK returns MessageAPIResponseBase, but we ignore it
 */
export type ReplyMessageFunction = (
  replyToken: string,
  messages: Message[]
) => Promise<unknown>;

