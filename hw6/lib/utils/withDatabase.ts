import connectDB from './mongodb';

/**
 * Higher-order function to automatically handle database connection
 * Wraps a function to ensure database is connected before execution
 * 
 * @param fn - Function to wrap
 * @returns Wrapped function with automatic database connection
 * 
 * @example
 * ```typescript
 * export const getStats = withDatabase(async () => {
 *   // Database is already connected here
 *   return await User.countDocuments();
 * });
 * ```
 */
export function withDatabase<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    // Ensure database is connected
    await connectDB();
    // Execute the wrapped function
    return await fn(...args);
  }) as T;
}

/**
 * Decorator for class methods to automatically handle database connection
 * Note: This is a simple implementation, TypeScript decorators require experimental support
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @withDatabaseMethod
 *   async myMethod() {
 *     // Database is connected
 *   }
 * }
 * ```
 */
export function withDatabaseMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    await connectDB();
    return await originalMethod.apply(this, args);
  };

  return descriptor;
}

