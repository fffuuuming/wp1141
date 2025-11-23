import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { logger } from './logger';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: Error | AppError | unknown,
  status?: number
): NextResponse<ApiResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    logger.error('API Error', error, { code: error.code, statusCode: error.statusCode });
    const errorJson = error.toJSON();
    const response: ApiResponse = {
      success: false,
      error: {
        code: String(errorJson.code),
        message: String(errorJson.message),
      },
    };
    if (errorJson.details) {
      response.error!.details = errorJson.details;
    }
    return NextResponse.json(response, { status: status || error.statusCode });
  }

  // Handle regular Error instances
  if (error instanceof Error) {
    logger.error('API Error', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'An internal error occurred' 
            : error.message,
        },
      },
      { status: status || 500 }
    );
  }

  // Handle unknown errors
  logger.error('Unknown API Error', error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      },
    },
    { status: status || 500 }
  );
}

/**
 * Wrap async API handler with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  }) as T;
}

