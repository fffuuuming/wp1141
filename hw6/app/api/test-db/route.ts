import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/mongodb';
import User from '@/lib/models/User';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';

/**
 * Test endpoint to verify database connection and models
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Test model compilation
    const userCount = await User.countDocuments();
    const conversationCount = await Conversation.countDocuments();
    const messageCount = await Message.countDocuments();

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        data: {
          userCount,
          conversationCount,
          messageCount,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

