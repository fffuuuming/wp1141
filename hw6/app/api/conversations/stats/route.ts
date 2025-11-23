import { NextRequest } from 'next/server';
import {
  getConversationStats,
  getUserStats,
  getConversationDetailStats,
  getUserDetailStats,
  getDateRangeStats,
} from '@/lib/services/statisticsService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { validateString, validateInt, validateDate, withValidation } from '@/lib/utils/requestValidator';

/**
 * GET /api/conversations/stats
 * Get conversation statistics
 */
export const GET = withValidation(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = validateString(searchParams.get('type'), 'type', {
      defaultValue: 'overview',
    });
    const userId = validateString(searchParams.get('userId'), 'userId', {
      required: false,
    });
    const startDate = validateDate(searchParams.get('startDate'), 'startDate', {
      required: false,
    });
    const endDate = validateDate(searchParams.get('endDate'), 'endDate', {
      required: false,
    });
    const limit = validateInt(searchParams.get('limit'), 'limit', {
      min: 1,
      max: 100,
      defaultValue: 50,
    });

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
          throw new Error('userId parameter is required');
        }
        const stats = await getUserDetailStats(userId);
        return successResponse(stats);
      }

      case 'daterange': {
        if (!startDate || !endDate) {
          throw new Error('startDate and endDate parameters are required');
        }
        const stats = await getDateRangeStats(startDate, endDate);
        return successResponse(stats);
      }

      default:
        throw new Error('Invalid type parameter');
    }
  } catch (error) {
    return errorResponse(error);
  }
});

