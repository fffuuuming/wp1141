/**
 * Error handling middleware
 * Centralized error handling for API routes
 */

import { NextResponse } from 'next/server'
import { HttpStatus, ErrorCode, ErrorResponse } from '@/types/api/errors'

/**
 * Check if error is an API error response
 */
function isApiError(error: unknown): error is ErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'status' in error
  )
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  // If it's already an API error, return it
  if (isApiError(error)) {
    return NextResponse.json(
      {
        error: error.error,
        code: error.code,
        details: error.details,
      },
      { status: error.status }
    )
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: error,
      },
      { status: HttpStatus.BAD_REQUEST }
    )
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    )
  }

  // Unknown error
  console.error('Unknown API Error:', error)
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR }
  )
}

