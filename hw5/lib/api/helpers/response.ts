/**
 * Response helpers
 * Utility functions for creating standardized API responses
 */

import { NextResponse } from 'next/server'
import { HttpStatus } from '@/types/api/errors'

/**
 * Create success response
 */
export function successResponse<T = unknown>(
  data: T,
  status: HttpStatus = HttpStatus.OK
): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Create created response (201)
 */
export function createdResponse<T = unknown>(data: T): NextResponse {
  return successResponse(data, HttpStatus.CREATED)
}

/**
 * Create error response
 */
export function errorResponse(
  error: string,
  status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Create not found response
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse(`${resource} not found`, HttpStatus.NOT_FOUND)
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, HttpStatus.UNAUTHORIZED)
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, HttpStatus.FORBIDDEN)
}

/**
 * Create bad request response
 */
export function badRequestResponse(message: string = 'Bad request'): NextResponse {
  return errorResponse(message, HttpStatus.BAD_REQUEST)
}

