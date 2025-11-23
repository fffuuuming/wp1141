import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation, Message } from '@/lib/models';

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
    const query: any = {};
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
    const conversationIds = conversations.map((c: any) => c._id);
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
    })
      .sort({ timestamp: 1 })
      .lean();

    // Group messages by conversation
    const messagesByConversation = new Map();
    messages.forEach((msg: any) => {
      const convId = msg.conversationId.toString();
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, []);
      }
      messagesByConversation.get(convId).push({
        id: msg._id.toString(),
        role: msg.role,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
      });
    });

    // Format response
    const formattedConversations = conversations.map((conv: any) => ({
      id: conv._id.toString(),
      userId: conv.userId?.lineUserId || '',
      displayName: conv.userId?.displayName || 'Unknown',
      pictureUrl: conv.userId?.pictureUrl,
      messageCount: conv.messageCount,
      startedAt: conv.startedAt,
      lastMessageAt: conv.lastMessageAt,
      isActive: conv.isActive,
      messages: messagesByConversation.get(conv._id.toString()) || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch conversations',
        },
        { status: 500 }
      );
    }
  })();
}

