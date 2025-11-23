import { AppError } from './AppError';

/**
 * Database operation errors
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    code: string = 'DATABASE_ERROR',
    details?: unknown
  ) {
    super(message, code, 500, true, details);
  }
}

/**
 * Database connection errors
 */
export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string = 'Failed to connect to database', details?: unknown) {
    super(message, 'DATABASE_CONNECTION_ERROR', details);
  }
}

/**
 * Database query errors
 */
export class DatabaseQueryError extends DatabaseError {
  constructor(message: string = 'Database query failed', details?: unknown) {
    super(message, 'DATABASE_QUERY_ERROR', details);
  }
}

