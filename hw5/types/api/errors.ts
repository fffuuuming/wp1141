/**
 * API error types
 * Standardized error codes and messages
 */

/**
 * HTTP status codes used in the API
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Business logic errors
  CHARACTER_LIMIT_EXCEEDED = 'CHARACTER_LIMIT_EXCEEDED',
  INVALID_USERID = 'INVALID_USERID',
  USERID_TAKEN = 'USERID_TAKEN',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Structured error response
 */
export interface StructuredError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

/**
 * Error response with status code
 */
export interface ErrorResponse {
  error: string
  code?: ErrorCode
  details?: Record<string, unknown>
  status: HttpStatus
}

