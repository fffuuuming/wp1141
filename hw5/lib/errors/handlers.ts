/**
 * Error Handlers
 * Enhanced error handling with logging and user-friendly messages
 */

import { NextResponse } from 'next/server'
import { HttpStatus, ErrorCode, ErrorResponse } from '@/types/api/errors'
import { logger } from './logger'
import { getUserFriendlyMessage } from './messages'
import type { LogContext } from './logger'

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
 * Check if error is a Zod validation error
 */
function isZodError(error: unknown): error is { issues: unknown[] } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  )
}

/**
 * Extract request context for logging
 */
function getRequestContext(request?: Request): LogContext {
  if (!request) return {}

  const url = new URL(request.url)
  return {
    route: url.pathname,
    method: request.method,
  }
}

/**
 * Handle API errors with enhanced logging
 */
export function handleApiError(
  error: unknown,
  request?: Request,
  context?: LogContext
): NextResponse {
  const requestContext = { ...getRequestContext(request), ...context }

  // If it's already an API error, log and return it
  if (isApiError(error)) {
    logger.apiError(
      `API Error: ${error.error}`,
      error,
      error.code || ErrorCode.INTERNAL_ERROR,
      error.status,
      requestContext
    )

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
  if (isZodError(error)) {
    logger.warn(
      'Validation error',
      error,
      { ...requestContext, issues: error.issues }
    )

    return NextResponse.json(
      {
        error: getUserFriendlyMessage(ErrorCode.VALIDATION_ERROR),
        code: ErrorCode.VALIDATION_ERROR,
        details: { issues: error.issues },
      },
      { status: HttpStatus.BAD_REQUEST }
    )
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    logger.error(
      `Unhandled error: ${error.message}`,
      error,
      ErrorCode.INTERNAL_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      requestContext
    )

    return NextResponse.json(
      {
        error: getUserFriendlyMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    )
  }

  // Unknown error
  logger.critical(
    'Unknown error type encountered',
    error,
    ErrorCode.INTERNAL_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR,
    requestContext
  )

  return NextResponse.json(
    {
      error: getUserFriendlyMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR }
  )
}

/**
 * Create a structured error response
 */
export function createErrorResponse(
  code: ErrorCode,
  status: HttpStatus,
  customMessage?: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: customMessage || getUserFriendlyMessage(code),
    code,
    details,
    status,
  }
}

/**
 * Throw a structured error (to be caught by error handler)
 */
export function throwError(
  code: ErrorCode,
  status: HttpStatus,
  customMessage?: string,
  details?: Record<string, unknown>
): never {
  throw createErrorResponse(code, status, customMessage, details)
}

