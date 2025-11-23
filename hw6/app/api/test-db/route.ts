import { NextRequest } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import User from '@/lib/models/User';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';

/**
 * Test endpoint to verify database connection and models
 * GET /api/test-db
 */
export async function GET(request: NextRequest) {
  return await withDatabase(async () => {
    try {
      // Test model compilation
      const userCount = await User.countDocuments();
      const conversationCount = await Conversation.countDocuments();
      const messageCount = await Message.countDocuments();

      return successResponse({
        message: 'Database connection successful',
        userCount,
        conversationCount,
        messageCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

