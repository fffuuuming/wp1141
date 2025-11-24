import { NextRequest } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation, Message } from '@/lib/models';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { validateInt, validateBoolean, validateString, validateDate, withValidation } from '@/lib/utils/requestValidator';
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
  return await withValidation(async () => {
    return await withDatabase(async () => {
      try {
        const searchParams = request.nextUrl.searchParams;
      const limit = validateInt(searchParams.get('limit'), 'limit', {
        min: 1,
        max: 100,
        defaultValue: 50,
      });
      const offset = validateInt(searchParams.get('offset'), 'offset', {
        min: 0,
        defaultValue: 0,
      });
      const isActive = validateBoolean(searchParams.get('active'), 'active');
      const userId = validateString(searchParams.get('userId'), 'userId', {
        required: false,
      });
      
      // Date range filters
      const startDate = validateDate(searchParams.get('startDate'), 'startDate', {
        required: false,
      });
      const endDate = validateDate(searchParams.get('endDate'), 'endDate', {
        required: false,
      });
      
      // Date filter type: 'startedAt' (default) or 'lastMessageAt'
      const dateFilterType = validateString(searchParams.get('dateFilterType'), 'dateFilterType', {
        required: false,
        defaultValue: 'lastMessageAt',
      });

      // Build query
      const query: Record<string, unknown> = {};
      if (isActive !== null) {
        query.isActive = isActive;
      }
      if (userId) {
        query.lineUserId = userId;
      }
      
      // Add date range filter
      if (startDate || endDate) {
        const dateField = dateFilterType === 'startedAt' ? 'startedAt' : 'lastMessageAt';
        const dateQuery: Record<string, unknown> = {};
        
        if (startDate) {
          dateQuery.$gte = startDate;
        }
        if (endDate) {
          // Add one day to endDate to include the entire end date
          const endDateInclusive = new Date(endDate);
          endDateInclusive.setHours(23, 59, 59, 999);
          dateQuery.$lte = endDateInclusive;
        }
        
        if (Object.keys(dateQuery).length > 0) {
          query[dateField] = dateQuery;
        }
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
  })();
}

