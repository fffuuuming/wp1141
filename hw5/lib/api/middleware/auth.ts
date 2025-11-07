/**
 * Authentication middleware
 * Middleware for protecting API routes with authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * Session with user data
 */
export interface AuthenticatedSession {
  user: {
    id: string
    userID: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

/**
 * Check if user is authenticated
 */
export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await auth()

  if (!session?.user?.id) {
    throw {
      error: 'Unauthorized',
      code: ErrorCode.UNAUTHORIZED,
      status: HttpStatus.UNAUTHORIZED,
    }
  }

  return session as AuthenticatedSession
}

/**
 * Get optional session (doesn't throw if not authenticated)
 */
export async function getOptionalSession(): Promise<AuthenticatedSession | null> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  return session as AuthenticatedSession
}

/**
 * Check if user owns a resource
 */
export function requireOwnership(
  resourceUserId: string,
  currentUserId: string
): void {
  if (resourceUserId !== currentUserId) {
    throw {
      error: 'Forbidden: You can only access your own resources',
      code: ErrorCode.FORBIDDEN,
      status: HttpStatus.FORBIDDEN,
    }
  }
}

