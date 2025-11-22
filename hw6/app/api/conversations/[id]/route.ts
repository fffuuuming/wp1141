import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/utils/mongodb';
import { Conversation, Message } from '@/lib/models';

/**
 * GET /api/conversations/[id]
 * Get a specific conversation with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const conversationId = params.id;

    // Get conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('userId', 'lineUserId displayName pictureUrl')
      .lean();

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation not found',
        },
        { status: 404 }
      );
    }

    // Get all messages for this conversation
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .sort({ timestamp: 1 })
      .lean();

    // Format response
    const formattedMessages = messages.map((msg: any) => ({
      id: msg._id.toString(),
      role: msg.role,
      type: msg.type,
      content: msg.content,
      metadata: msg.metadata || {},
      timestamp: msg.timestamp,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: conversation._id.toString(),
        userId: (conversation as any).userId?.lineUserId || '',
        displayName: (conversation as any).userId?.displayName || 'Unknown',
        pictureUrl: (conversation as any).userId?.pictureUrl,
        title: conversation.title,
        messageCount: conversation.messageCount,
        startedAt: conversation.startedAt,
        lastMessageAt: conversation.lastMessageAt,
        endedAt: conversation.endedAt,
        isActive: conversation.isActive,
        messages: formattedMessages,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversation',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update conversation (e.g., mark as inactive, update title)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const conversationId = params.id;
    const body = await request.json();

    // Allowed fields to update
    const allowedFields: any = {};
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
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: conversation._id.toString(),
        userId: (conversation as any).userId?.lineUserId || '',
        displayName: (conversation as any).userId?.displayName || 'Unknown',
        messageCount: conversation.messageCount,
        isActive: conversation.isActive,
        title: conversation.title,
      },
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update conversation',
      },
      { status: 500 }
    );
  }
}

