import { AppError } from './AppError';

/**
 * Line API errors
 */
export class LineAPIError extends AppError {
  constructor(
    message: string = 'Line API operation failed',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message, 'LINE_API_ERROR', statusCode, true, details);
  }
}

/**
 * Line API authentication error
 */
export class LineAPIAuthError extends LineAPIError {
  constructor(message: string = 'Line API authentication failed', details?: unknown) {
    super(message, 401, details);
    // Override code by calling parent with specific code
    Object.defineProperty(this, 'code', {
      value: 'LINE_API_AUTH_ERROR',
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
}

/**
 * Line API rate limit error
 */
export class LineAPIRateLimitError extends LineAPIError {
  constructor(message: string = 'Line API rate limit exceeded', details?: unknown) {
    super(message, 429, details);
    // Override code by calling parent with specific code
    Object.defineProperty(this, 'code', {
      value: 'LINE_API_RATE_LIMIT',
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
}

