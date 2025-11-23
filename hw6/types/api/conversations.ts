import type { IConversation, IMessage } from '@/lib/models';

/**
 * Conversation list item (for API responses)
 */
export interface ConversationListItem {
  id: string;
  userId: string;
  displayName: string;
  pictureUrl?: string;
  messageCount: number;
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  messages: MessageListItem[];
}

/**
 * Message list item (for API responses)
 */
export interface MessageListItem {
  id: string;
  role: 'user' | 'bot';
  type: string;
  content: string;
  timestamp: Date;
}

/**
 * Conversation detail (for API responses)
 */
export interface ConversationDetail extends ConversationListItem {
  endedAt?: Date;
  title?: string;
}

/**
 * Conversation query parameters
 */
export interface ConversationQueryParams {
  limit?: number;
  offset?: number;
  active?: boolean;
  userId?: string;
}

/**
 * Conversation update request
 */
export interface ConversationUpdateRequest {
  title?: string;
  isActive?: boolean;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Conversation list response
 */
export interface ConversationListResponse {
  conversations: ConversationListItem[];
  pagination: PaginationInfo;
}

