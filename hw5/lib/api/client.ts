/**
 * API Client
 * Centralized HTTP client with interceptors, error handling, and type safety
 */

import { ErrorResponse, HttpStatus, ErrorCode } from '@/types/api/errors'

/**
 * API client configuration
 */
interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  timeout?: number
}

/**
 * API client class
 */
class ApiClient {
  private baseURL: string
  private timeout: number
  private retries: number
  private retryDelay: number

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || ''
    this.timeout = config.timeout || 30000
    this.retries = config.retries || 0
    this.retryDelay = config.retryDelay || 1000
  }

  /**
   * Get authentication token from session
   */
  private async getAuthToken(): Promise<string | null> {
    // In Next.js, we'll handle auth in middleware
    // This is a placeholder for future token-based auth
    return null
  }

  /**
   * Create timeout promise
   */
  private createTimeout(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    })
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown, response?: Response): ErrorResponse {
    if (error instanceof Error) {
      return {
        error: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      }
    }

    if (response) {
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status as HttpStatus,
      }
    }

    return {
      error: 'Unknown error occurred',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    }
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<ErrorResponse> {
    try {
      const data = await response.json()
      return {
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        code: data.code,
        details: data.details,
        status: response.status as HttpStatus,
      }
    } catch {
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status as HttpStatus,
      }
    }
  }

  /**
   * Retry request on failure
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retriesLeft: number
  ): Promise<T> {
    try {
      return await requestFn()
    } catch (error) {
      if (retriesLeft > 0 && this.isRetryableError(error)) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
        return this.retryRequest(requestFn, retriesLeft - 1)
      }
      throw error
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('timeout') || error.message.includes('network')
    }
    return false
  }

  /**
   * Make HTTP request
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const timeout = options.timeout || this.timeout

    // Build headers
    const headers = new Headers(options.headers)
    
    // Set content type if body is present
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    // Build request options
    const requestOptions: RequestInit = {
      ...options,
      headers,
    }

    // Create request function
    const makeRequest = async (): Promise<T> => {
      try {
        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(url, requestOptions),
          this.createTimeout(timeout),
        ]) as Response

        // Handle non-OK responses
        if (!response.ok) {
          const error = await this.parseErrorResponse(response)
          throw error
        }

        // Parse JSON response
        const data = await response.json()
        return data as T
      } catch (error) {
        // Re-throw API errors
        if (error && typeof error === 'object' && 'status' in error) {
          throw error
        }

        // Handle network/timeout errors
        const apiError = this.handleError(error)
        throw apiError
      }
    }

    // Retry if configured
    if (this.retries > 0) {
      return this.retryRequest(makeRequest, this.retries)
    }

    return makeRequest()
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  baseURL: '',
  timeout: 30000,
  retries: 0,
})

/**
 * Create custom API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}

