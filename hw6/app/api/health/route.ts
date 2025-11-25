import { NextResponse } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { config } from '@/lib/config';
import mongoose from 'mongoose';
import { logger } from '@/lib/utils/logger';

/**
 * Health check response interface
 */
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      latency?: number;
    };
    line: {
      status: 'configured' | 'not_configured';
    };
    llm: {
      status: 'configured' | 'not_configured';
      provider?: string;
    };
  };
  uptime: number;
  version?: string;
}

const startTime = Date.now();

// Force dynamic rendering - this route uses database connections and timestamps
export const dynamic = 'force-dynamic';

/**
 * Check MongoDB connection health
 */
async function checkDatabase(): Promise<{
  status: 'connected' | 'disconnected' | 'error';
  latency?: number;
}> {
  try {
    const start = Date.now();
    const state = mongoose.connection.readyState;
    const latency = Date.now() - start;

    // MongoDB readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Test with a simple query
      await mongoose.connection.db?.admin().ping();
      return { status: 'connected', latency };
    } else {
      return { status: 'disconnected' };
    }
  } catch (error) {
    logger.error('Database health check failed', error);
    return { status: 'error' };
  }
}

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
  try {
    // Check database connection
    const dbHealth = await withDatabase(async () => {
      return await checkDatabase();
    })();

    // Check Line configuration
    const lineConfigured =
      !!config.LINE_CHANNEL_SECRET && !!config.LINE_CHANNEL_ACCESS_TOKEN;

    // Check LLM configuration
    const llmConfigured =
      (config.LLM_PROVIDER === 'openai' && !!config.OPENAI_API_KEY) ||
      (config.LLM_PROVIDER === 'anthropic' && !!config.ANTHROPIC_API_KEY);

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (dbHealth.status !== 'connected') {
      overallStatus = 'unhealthy';
    } else if (!lineConfigured || !llmConfigured) {
      overallStatus = 'degraded';
    }

    const uptime = Math.floor((Date.now() - startTime) / 1000); // in seconds

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        line: {
          status: lineConfigured ? 'configured' : 'not_configured',
        },
        llm: {
          status: llmConfigured ? 'configured' : 'not_configured',
          provider: config.LLM_PROVIDER,
        },
      },
      uptime,
    };

    // Return appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    logger.error('Health check error', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

