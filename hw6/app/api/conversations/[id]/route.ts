import { NextRequest } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { Conversation, Message } from '@/lib/models';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import type { ConversationDetail, MessageListItem } from '@/types/api/conversations';
import type mongoose from 'mongoose';

/**
 * GET /api/conversations/[id]
 * Get a specific conversation with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await withDatabase(async () => {
    try {

    const conversationId = params.id;

    // Get conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('userId', 'lineUserId displayName pictureUrl')
      .lean();

    if (!conversation) {
      return errorResponse(new Error('Conversation not found'), 404);
    }

    // Get all messages for this conversation
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .sort({ timestamp: 1 })
      .lean();

    // Format response
    const formattedMessages: MessageListItem[] = messages.map((msg) => ({
      id: String(msg._id),
      role: msg.role,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    const populatedUserId = conversation.userId as {
      lineUserId?: string;
      displayName?: string;
      pictureUrl?: string;
    } | null;

    const conversationDetail: ConversationDetail = {
      id: String(conversation._id),
      userId: populatedUserId?.lineUserId || '',
      displayName: populatedUserId?.displayName || 'Unknown',
      pictureUrl: populatedUserId?.pictureUrl,
      title: conversation.title,
      messageCount: conversation.messageCount,
      startedAt: conversation.startedAt,
      lastMessageAt: conversation.lastMessageAt,
      endedAt: conversation.endedAt,
      isActive: conversation.isActive,
      messages: formattedMessages,
    };

    return successResponse(conversationDetail);
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

/**
 * PATCH /api/conversations/[id]
 * Update conversation (e.g., mark as inactive, update title)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await withDatabase(async () => {
    try {

    const conversationId = params.id;
    const body = await request.json() as {
      isActive?: boolean;
      title?: string;
    };

    // Allowed fields to update
    const allowedFields: Record<string, unknown> = {};
    if (body.isActive !== undefined) {
      allowedFields.isActive = body.isActive;
      if (!body.isActive) {
        allowedFields.endedAt = new Date();
      }
    }
    if (body.title !== undefined) {
      allowedFields.title = body.title;
    }

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: allowedFields },
      { new: true }
    )
      .populate('userId', 'lineUserId displayName pictureUrl')
      .lean();

    if (!conversation) {
      return errorResponse(new Error('Conversation not found'), 404);
    }

    const populatedUserId = conversation.userId as {
      lineUserId?: string;
      displayName?: string;
    } | null;

    return successResponse({
      id: String(conversation._id),
      userId: populatedUserId?.lineUserId || '',
      displayName: populatedUserId?.displayName || 'Unknown',
      messageCount: conversation.messageCount,
      isActive: conversation.isActive,
      title: conversation.title,
    });
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

