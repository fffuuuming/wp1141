/**
 * Error handling middleware
 * Centralized error handling for API routes
 * 
 * @deprecated Use handleApiError from @/lib/errors/handlers instead
 * This file is kept for backward compatibility but will be removed in future
 */

import { NextRequest } from 'next/server'
import { handleApiError as newHandleApiError } from '@/lib/errors/handlers'

/**
 * Handle API errors and return appropriate response
 * 
 * @deprecated Use handleApiError from @/lib/errors/handlers instead
 */
export function handleApiError(error: unknown, request?: NextRequest): ReturnType<typeof newHandleApiError> {
  return newHandleApiError(error, request)
}

