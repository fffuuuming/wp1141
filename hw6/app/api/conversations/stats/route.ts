import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationStats,
  getUserStats,
  getConversationDetailStats,
  getUserDetailStats,
  getDateRangeStats,
} from '@/lib/services/statisticsService';

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
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case 'users': {
        const stats = await getUserStats(limit);
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case 'conversations': {
        const stats = await getConversationDetailStats(limit);
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case 'user': {
        if (!userId) {
          return NextResponse.json(
            {
              success: false,
              error: 'userId parameter is required',
            },
            { status: 400 }
          );
        }
        const stats = await getUserDetailStats(userId);
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case 'daterange': {
        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              success: false,
              error: 'startDate and endDate parameters are required',
            },
            { status: 400 }
          );
        }
        const stats = await getDateRangeStats(
          new Date(startDate),
          new Date(endDate)
        );
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid type parameter',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}

