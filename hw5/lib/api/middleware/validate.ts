/**
 * Validation middleware
 * Middleware for validating request bodies and query parameters
 */

import { NextRequest } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    // Handle empty body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]
      throw {
        error: firstError?.message || 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: error.issues,
        status: HttpStatus.BAD_REQUEST,
      }
    }
    throw {
      error: 'Invalid request body',
      code: ErrorCode.INVALID_INPUT,
      status: HttpStatus.BAD_REQUEST,
    }
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]
      throw {
        error: firstError?.message || 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: error.issues,
        status: HttpStatus.BAD_REQUEST,
      }
    }
    throw {
      error: 'Invalid query parameters',
      code: ErrorCode.INVALID_INPUT,
      status: HttpStatus.BAD_REQUEST,
    }
  }
}

/**
 * Validate route parameters with Zod schema
 * Handles both sync and async params (Next.js 16+)
 */
export async function validateParams<T>(
  params: Record<string, string | undefined> | Promise<Record<string, string | undefined>>,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const resolvedParams = await Promise.resolve(params)
    return schema.parse(resolvedParams)
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]
      throw {
        error: firstError?.message || 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: error.issues,
        status: HttpStatus.BAD_REQUEST,
      }
    }
    throw {
      error: 'Invalid route parameters',
      code: ErrorCode.INVALID_INPUT,
      status: HttpStatus.BAD_REQUEST,
    }
  }
}

