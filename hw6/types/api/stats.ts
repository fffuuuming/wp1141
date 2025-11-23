/**
 * Statistics API types
 */

export interface ConversationStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  activeConversations: number;
  averageMessagesPerConversation: number;
  averageMessagesPerUser: number;
}

export interface UserStats {
  userId: string;
  displayName?: string;
  messageCount: number;
  conversationCount: number;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface ConversationDetailStats {
  conversationId: string;
  userId: string;
  displayName?: string;
  messageCount: number;
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  duration: number; // in minutes
}

export interface UserDetailStats {
  user: UserStats | null;
  conversations: ConversationDetailStats[];
  totalMessages: number;
}

export interface DateRangeStats {
  messages: number;
  conversations: number;
  users: number;
  newUsers: number;
}

export type StatsType = 'overview' | 'users' | 'conversations' | 'user' | 'daterange';

export interface StatsQueryParams {
  type?: StatsType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

