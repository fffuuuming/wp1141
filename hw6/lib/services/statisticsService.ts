import { withDatabase } from '@/lib/utils/withDatabase';
import { User, Conversation, Message } from '@/lib/models';

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

/**
 * Get overall conversation statistics
 */
export const getConversationStats = withDatabase(async (): Promise<ConversationStats> => {

  const [
    totalUsers,
    totalConversations,
    totalMessages,
    activeConversations,
  ] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments(),
    Message.countDocuments(),
    Conversation.countDocuments({ isActive: true }),
  ]);

  const averageMessagesPerConversation =
    totalConversations > 0 ? totalMessages / totalConversations : 0;
  const averageMessagesPerUser =
    totalUsers > 0 ? totalMessages / totalUsers : 0;

  return {
    totalUsers,
    totalConversations,
    totalMessages,
    activeConversations,
    averageMessagesPerConversation: Math.round(averageMessagesPerConversation * 100) / 100,
    averageMessagesPerUser: Math.round(averageMessagesPerUser * 100) / 100,
  };
});

/**
 * Get user statistics
 */
export const getUserStats = withDatabase(async (limit: number = 50): Promise<UserStats[]> => {

  const users = await User.find({})
    .sort({ messageCount: -1, lastActiveAt: -1 })
    .limit(limit)
    .select('lineUserId displayName messageCount lastActiveAt createdAt')
    .lean();

  // Get conversation count for each user
  const userIds = users.map((u) => u._id.toString());
  const conversationCounts = await Conversation.aggregate([
    { $match: { userId: { $in: userIds.map((id) => id as any) } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    conversationCounts.map((c) => [c._id.toString(), c.count])
  );

  return users.map((user) => ({
    userId: user.lineUserId,
    displayName: user.displayName,
    messageCount: user.messageCount,
    conversationCount: countMap.get(user._id.toString()) || 0,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
  }));
});

/**
 * Get conversation detail statistics
 */
export const getConversationDetailStats = withDatabase(async (
  limit: number = 50
): Promise<ConversationDetailStats[]> => {

  const conversations = await Conversation.find({})
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .populate('userId', 'lineUserId displayName')
    .lean();

  return conversations.map((conv: any) => {
    const duration =
      (new Date(conv.lastMessageAt).getTime() -
        new Date(conv.startedAt).getTime()) /
      (1000 * 60); // Convert to minutes

    return {
      conversationId: conv._id.toString(),
      userId: conv.userId?.lineUserId || '',
      displayName: conv.userId?.displayName,
      messageCount: conv.messageCount,
      startedAt: conv.startedAt,
      lastMessageAt: conv.lastMessageAt,
      isActive: conv.isActive,
      duration: Math.round(duration * 100) / 100,
    };
  });
});

/**
 * Get statistics for a specific user
 */
export const getUserDetailStats = withDatabase(async (
  lineUserId: string
): Promise<{
  user: UserStats | null;
  conversations: ConversationDetailStats[];
  totalMessages: number;
}> => {

  const user = await User.findOne({ lineUserId }).lean();
  if (!user) {
    return { user: null, conversations: [], totalMessages: 0 };
  }

  const conversations = await Conversation.find({ userId: user._id })
    .sort({ lastMessageAt: -1 })
    .lean();

  const conversationDetails: ConversationDetailStats[] = conversations.map(
    (conv: any) => {
      const duration =
        (new Date(conv.lastMessageAt).getTime() -
          new Date(conv.startedAt).getTime()) /
        (1000 * 60);

      return {
        conversationId: conv._id.toString(),
        userId: lineUserId,
        displayName: user.displayName,
        messageCount: conv.messageCount,
        startedAt: conv.startedAt,
        lastMessageAt: conv.lastMessageAt,
        isActive: conv.isActive,
        duration: Math.round(duration * 100) / 100,
      };
    }
  );

  const totalMessages = await Message.countDocuments({
    conversationId: { $in: conversations.map((c) => c._id) },
  });

  return {
    user: {
      userId: user.lineUserId,
      displayName: user.displayName,
      messageCount: user.messageCount,
      conversationCount: conversations.length,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
    },
    conversations: conversationDetails,
    totalMessages,
  };
});

/**
 * Get statistics for date range
 */
export const getDateRangeStats = withDatabase(async (
  startDate: Date,
  endDate: Date
): Promise<{
  messages: number;
  conversations: number;
  users: number;
  newUsers: number;
}> => {

  const [messages, conversations, users, newUsers] = await Promise.all([
    Message.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
    }),
    Conversation.countDocuments({
      startedAt: { $gte: startDate, $lte: endDate },
    }),
    User.countDocuments({
      lastActiveAt: { $gte: startDate, $lte: endDate },
    }),
    User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    }),
  ]);

  return {
    messages,
    conversations,
    users,
    newUsers,
  };
});

