import { NextRequest } from 'next/server';
import {
  getConversationStats,
  getUserStats,
  getConversationDetailStats,
  getUserDetailStats,
  getDateRangeStats,
} from '@/lib/services/statisticsService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

/**
 * GET /api/conversations/stats
 * Get conversation statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview';
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (type) {
      case 'overview': {
        const stats = await getConversationStats();
        return successResponse(stats);
      }

      case 'users': {
        const stats = await getUserStats(limit);
        return successResponse(stats);
      }

      case 'conversations': {
        const stats = await getConversationDetailStats(limit);
        return successResponse(stats);
      }

      case 'user': {
        if (!userId) {
          return errorResponse(new Error('userId parameter is required'), 400);
        }
        const stats = await getUserDetailStats(userId);
        return successResponse(stats);
      }

      case 'daterange': {
        if (!startDate || !endDate) {
          return errorResponse(
            new Error('startDate and endDate parameters are required'),
            400
          );
        }
        const stats = await getDateRangeStats(
          new Date(startDate),
          new Date(endDate)
        );
        return successResponse(stats);
      }

      default:
        return errorResponse(new Error('Invalid type parameter'), 400);
    }
  } catch (error) {
    return errorResponse(error);
  }
}

