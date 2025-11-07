/**
 * Route handler wrapper
 * Higher-order function to wrap API route handlers with middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedSession } from '../middleware/auth'
import { handleApiError } from '@/lib/errors/handlers'

/**
 * Route handler function type
 * Supports both sync and async params (Next.js 16+)
 */
type RouteHandler = (
  request: NextRequest,
  context: {
    params: Promise<Record<string, string | undefined>> | Record<string, string | undefined>
    session?: AuthenticatedSession
  }
) => Promise<NextResponse>

/**
 * Wrap route handler with authentication
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      const session = await requireAuth()
      return handler(request, { ...context, session })
    } catch (error) {
      return handleApiError(error, request, { userId: context.session?.user.id })
    }
  }
}

/**
 * Wrap route handler with optional authentication
 */
export function withOptionalAuth(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      const { getOptionalSession } = await import('../middleware/auth')
      const session = await getOptionalSession()
      return handler(request, { ...context, session: session || undefined })
    } catch (error) {
      return handleApiError(error, request, { userId: context.session?.user.id })
    }
  }
}

/**
 * Wrap route handler with error handling only
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return handler(request, context)
    } catch (error) {
      return handleApiError(error, request, { userId: context.session?.user.id })
    }
  }
}

/**
 * Combine multiple wrappers
 */
export function composeWrappers(...wrappers: Array<(h: RouteHandler) => RouteHandler>) {
  return (handler: RouteHandler): RouteHandler => {
    return wrappers.reduceRight((acc, wrapper) => wrapper(acc), handler)
  }
}

