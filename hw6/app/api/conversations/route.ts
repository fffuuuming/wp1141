import { NextRequest } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation, Message } from '@/lib/models';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import type {
  ConversationListResponse,
  ConversationQueryParams,
  ConversationListItem,
  MessageListItem,
} from '@/types/api/conversations';
import type mongoose from 'mongoose';

/**
 * GET /api/conversations
 * Get list of conversations with optional filters
 */
export async function GET(request: NextRequest) {
  return await withDatabase(async () => {
    try {

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const isActive = searchParams.get('active');
    const userId = searchParams.get('userId');

    // Build query
    const query: Record<string, unknown> = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    if (userId) {
      query.lineUserId = userId;
    }

    // Get conversations
    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('userId', 'lineUserId displayName pictureUrl')
      .lean();

    // Get total count
    const total = await Conversation.countDocuments(query);

    // Get messages for each conversation
    const conversationIds = conversations.map(
      (c) => c._id as mongoose.Types.ObjectId
    );
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
    })
      .sort({ timestamp: 1 })
      .lean();

    // Group messages by conversation
    const messagesByConversation = new Map<string, MessageListItem[]>();
    messages.forEach((msg) => {
      const convId = String(msg.conversationId);
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, []);
      }
      messagesByConversation.get(convId)!.push({
        id: String(msg._id),
        role: msg.role,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
      });
    });

    // Format response
    const formattedConversations: ConversationListItem[] = conversations.map(
      (conv) => ({
        id: String(conv._id),
        userId: (conv.userId as { lineUserId?: string })?.lineUserId || '',
        displayName:
          (conv.userId as { displayName?: string })?.displayName || 'Unknown',
        pictureUrl: (conv.userId as { pictureUrl?: string })?.pictureUrl,
        messageCount: conv.messageCount,
        startedAt: conv.startedAt,
        lastMessageAt: conv.lastMessageAt,
        isActive: conv.isActive,
        messages: messagesByConversation.get(String(conv._id)) || [],
      })
    );

    const response: ConversationListResponse = {
      conversations: formattedConversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
    return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

