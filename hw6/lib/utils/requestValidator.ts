import { NextRequest } from 'next/server';
import { errorResponse } from './apiResponse';

/**
 * Validation error for request parameters
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate query parameter as integer
 */
export function validateInt(
  value: string | null,
  fieldName: string,
  options?: { min?: number; max?: number; defaultValue?: number }
): number {
  if (!value) {
    if (options?.defaultValue !== undefined) {
      return options.defaultValue;
    }
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }

  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid integer`, fieldName);
  }

  if (options?.min !== undefined && num < options.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.min}`,
      fieldName
    );
  }

  if (options?.max !== undefined && num > options.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.max}`,
      fieldName
    );
  }

  return num;
}

/**
 * Validate query parameter as string
 */
export function validateString(
  value: string | null,
  fieldName: string,
  options?: { required?: boolean; minLength?: number; maxLength?: number; defaultValue?: string }
): string {
  if (!value) {
    if (options?.defaultValue !== undefined) {
      return options.defaultValue;
    }
    if (options?.required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return '';
  }

  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.minLength} characters`,
      fieldName
    );
  }

  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      fieldName
    );
  }

  return value;
}

/**
 * Validate query parameter as date
 */
export function validateDate(
  value: string | null,
  fieldName: string,
  options?: { required?: boolean }
): Date | null {
  if (!value) {
    if (options?.required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return null;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`, fieldName);
  }

  return date;
}

/**
 * Validate query parameter as boolean
 */
export function validateBoolean(
  value: string | null,
  fieldName: string,
  defaultValue?: boolean
): boolean | null {
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return null;
  }

  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1') {
    return true;
  }
  if (lowerValue === 'false' || lowerValue === '0') {
    return false;
  }

  throw new ValidationError(
    `${fieldName} must be a valid boolean (true/false)`,
    fieldName
  );
}

/**
 * Wrap request handler with validation error handling
 */
export function withValidation<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ValidationError) {
        return errorResponse(error, 400);
      }
      // If the error is already a NextResponse (from withDatabase), return it
      if (error && typeof error === 'object' && 'status' in error && 'json' in error) {
        return error;
      }
      // Otherwise, wrap it in an error response
      return errorResponse(error);
    }
  }) as T;
}

