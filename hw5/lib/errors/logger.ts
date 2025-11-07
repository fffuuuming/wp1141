/**
 * Error Logger
 * Structured error logging with context and severity levels
 */

import { ErrorCode, HttpStatus } from '@/types/api/errors'

/**
 * Log severity levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Log context metadata
 */
export interface LogContext {
  userId?: string
  userID?: string
  requestId?: string
  route?: string
  method?: string
  [key: string]: unknown
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel
  message: string
  error?: Error | unknown
  code?: ErrorCode
  status?: HttpStatus
  context?: LogContext
  timestamp: string
}

/**
 * Error logger class
 */
class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log an error with context
   */
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    }

    // In development, log to console with formatting
    if (this.isDevelopment) {
      this.logToConsole(logEntry)
    }

    // In production, you could send to external logging service
    // e.g., Sentry, LogRocket, Datadog, etc.
    if (!this.isDevelopment) {
      this.logToService(logEntry)
    }
  }

  /**
   * Log to console (development)
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level}] [${entry.timestamp}]`
    const contextStr = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : ''
    const codeStr = entry.code ? `\nCode: ${entry.code}` : ''
    const statusStr = entry.status ? `\nStatus: ${entry.status}` : ''

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}${codeStr}${statusStr}${contextStr}`)
        break
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}${codeStr}${statusStr}${contextStr}`)
        break
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}${codeStr}${statusStr}${contextStr}`)
        if (entry.error) console.warn('Error:', entry.error)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`${prefix} ${entry.message}${codeStr}${statusStr}${contextStr}`)
        if (entry.error) console.error('Error:', entry.error)
        if (entry.error instanceof Error && entry.error.stack) {
          console.error('Stack:', entry.error.stack)
        }
        break
    }
  }

  /**
   * Log to external service (production)
   * This is a placeholder - implement based on your logging service
   */
  private logToService(entry: LogEntry): void {
    // TODO: Implement integration with logging service
    // Examples:
    // - Sentry.captureException(entry.error, { extra: entry.context })
    // - LogRocket.captureException(entry.error)
    // - Datadog.logger.error(entry.message, { ...entry.context, error: entry.error })
    
    // For now, still log critical errors to console
    if (entry.level === LogLevel.CRITICAL || entry.level === LogLevel.ERROR) {
      console.error(`[${entry.level}] ${entry.message}`, {
        error: entry.error,
        context: entry.context,
        code: entry.code,
        status: entry.status,
      })
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log({ level: LogLevel.DEBUG, message, context })
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log({ level: LogLevel.INFO, message, context })
  }

  /**
   * Log warning
   */
  warn(message: string, error?: unknown, context?: LogContext): void {
    this.log({ level: LogLevel.WARN, message, error, context })
  }

  /**
   * Log error
   */
  error(
    message: string,
    error?: unknown,
    code?: ErrorCode,
    status?: HttpStatus,
    context?: LogContext
  ): void {
    this.log({ level: LogLevel.ERROR, message, error, code, status, context })
  }

  /**
   * Log critical error
   */
  critical(
    message: string,
    error?: unknown,
    code?: ErrorCode,
    status?: HttpStatus,
    context?: LogContext
  ): void {
    this.log({ level: LogLevel.CRITICAL, message, error, code, status, context })
  }

  /**
   * Log API error
   */
  apiError(
    message: string,
    error: unknown,
    code: ErrorCode,
    status: HttpStatus,
    context?: LogContext
  ): void {
    // Only log non-client errors (4xx) as warnings, server errors (5xx) as errors
    if (status >= 500) {
      this.error(message, error, code, status, context)
    } else if (status >= 400) {
      this.warn(message, error, context)
    } else {
      this.info(message, context)
    }
  }
}

// Export singleton instance
export const logger = new ErrorLogger()

