import OpenAI from 'openai';
import { config } from '@/lib/config';
import {
  LLMError,
  LLMRateLimitError,
  LLMQuotaExceededError,
  LLMAuthError,
  LLMNetworkError,
} from '@/lib/errors';
import { logger } from '@/lib/utils/logger';

/**
 * Embedding Service for OpenAI Embeddings API
 * Generates high-dimensional vectors from text for semantic search
 */
class EmbeddingService {
  private client!: OpenAI; // Definite assignment - initialized in initialize()
  private model!: string; // Definite assignment - initialized in initialize()
  private maxRetries!: number; // Definite assignment - initialized in initialize()
  private retryDelay!: number; // Definite assignment - initialized in initialize()

  private initialized = false;

  constructor() {
    // Don't initialize in constructor - do it lazily when first used
  }

  /**
   * Initialize the service (lazy initialization)
   * This allows the module to be imported during build without failing
   */
  private initialize() {
    if (this.initialized) {
      return;
    }

    if (!config.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for embedding service');
    }

    this.client = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
    this.model = config.OPENAI_EMBEDDING_MODEL;
    this.maxRetries = config.LLM_MAX_RETRIES;
    this.retryDelay = config.LLM_RETRY_DELAY;
    this.initialized = true;
  }

  /**
   * Generate embedding for a single text
   * @param text - Text to generate embedding for
   * @returns Embedding vector (array of numbers)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    this.initialize(); // Lazy initialization

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.embeddings.create({
          model: this.model,
          input: text.trim(),
        });

        const embedding = response.data[0]?.embedding;
        if (!embedding || embedding.length === 0) {
          throw new Error('Empty embedding returned from API');
        }

        // Verify dimensions
        if (embedding.length !== config.EMBEDDING_DIMENSIONS) {
          logger.warn('Embedding dimensions mismatch', {
            expected: config.EMBEDDING_DIMENSIONS,
            actual: embedding.length,
          });
        }

        logger.debug('Embedding generated', {
          textLength: text.length,
          dimensions: embedding.length,
        });

        return embedding;
      } catch (error: unknown) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt === this.maxRetries) {
          throw this.handleError(error);
        }

        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        logger.debug('Embedding retry', { attempt, delay, error: String(error) });
        await this.sleep(delay);
      }
    }

    throw this.handleError(lastError || new Error('Unknown error'));
  }

  /**
   * Generate embeddings for multiple texts
   * @param texts - Array of texts to generate embeddings for
   * @returns Array of embedding vectors
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    this.initialize(); // Lazy initialization

    if (texts.length === 0) {
      return [];
    }

    // OpenAI embeddings API supports batch requests
    // But we'll process in smaller batches to avoid rate limits
    const batchSize = 10; // Process 10 at a time
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      logger.debug('Processing embedding batch', {
        batch: i / batchSize + 1,
        total: Math.ceil(texts.length / batchSize),
        size: batch.length,
      });

      // Process batch in parallel with rate limiting
      const batchPromises = batch.map((text, index) =>
        this.generateEmbedding(text).catch((error) => {
          logger.error('Error generating embedding in batch', error, {
            textIndex: i + index,
            textPreview: text.substring(0, 50),
          });
          // Return null for failed embeddings
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((r): r is number[] => r !== null));

      // Add small delay between batches to avoid rate limits
      if (i + batchSize < texts.length) {
        await this.sleep(100); // 100ms delay between batches
      }
    }

    return results;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const openaiError = error as { status?: number; code?: string };

      // Rate limit errors (429)
      if (openaiError.status === 429) {
        return true;
      }

      // Server errors (5xx)
      if (openaiError.status && openaiError.status >= 500 && openaiError.status < 600) {
        return true;
      }
    }

    // Network errors (check for error code)
    if (error && typeof error === 'object' && 'code' in error) {
      const networkError = error as { code?: string };
      if (
        networkError.code === 'ECONNRESET' ||
        networkError.code === 'ETIMEDOUT' ||
        networkError.code === 'ENOTFOUND'
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): LLMError {
    if (error && typeof error === 'object' && 'status' in error) {
      const openaiError = error as {
        status?: number;
        message?: string;
        error?: { message?: string };
      };

      // Rate limit error
      if (openaiError.status === 429) {
        return new LLMRateLimitError('Embedding API 請求過於頻繁，請稍後再試。', {
          originalError: openaiError.message,
        });
      }

      // Quota exceeded
      if (openaiError.status === 402 || openaiError.status === 403) {
        return new LLMQuotaExceededError('Embedding API 配額已用完，請檢查您的帳戶設定。', {
          originalError: openaiError.message,
        });
      }

      // Authentication error
      if (openaiError.status === 401) {
        return new LLMAuthError('Embedding API 金鑰無效，請檢查環境變數設定。', {
          originalError: openaiError.message,
        });
      }

      // Network error
      if (openaiError.status === 408 || openaiError.status === 504) {
        return new LLMNetworkError('網路連線錯誤，請稍後再試。', {
          originalError: openaiError.message,
        });
      }

      // Unknown error with status
      return new LLMError(
        openaiError.error?.message || openaiError.message || '發生未知錯誤',
        'UNKNOWN_ERROR',
        openaiError.status || 500,
        false,
        { originalError: openaiError }
      );
    }

    // Unknown error without OpenAI structure
    const errorMessage = error instanceof Error ? error.message : '發生未知錯誤';
    return new LLMError(errorMessage, 'UNKNOWN_ERROR', 500, false, {
      originalError: error,
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();

