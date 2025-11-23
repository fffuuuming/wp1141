import axios from 'axios';
import { config } from '@/lib/config';
import {
  LLMError,
  LLMRateLimitError,
  LLMQuotaExceededError,
  LLMAuthError,
  LLMNetworkError,
} from '@/lib/errors';
import { logger } from '@/lib/utils/logger';
import {
  OPENAI_CONFIG,
  ANTHROPIC_CONFIG,
  SYSTEM_PROMPT,
} from '@/lib/constants/llm';

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Keep old interface for backward compatibility during migration
export interface LLMErrorInterface {
  code: string;
  message: string;
  retryable: boolean;
}

/**
 * LLM Service for OpenAI and Anthropic
 */
class LLMService {
  private provider: 'openai' | 'anthropic';
  private apiKey: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor() {
    this.provider = config.LLM_PROVIDER;
    this.apiKey =
      this.provider === 'openai'
        ? config.OPENAI_API_KEY || ''
        : config.ANTHROPIC_API_KEY || '';
    this.maxRetries = config.LLM_MAX_RETRIES;
    this.retryDelay = config.LLM_RETRY_DELAY;
  }

  /**
   * Generate response using LLM
   */
  async generateResponse(
    prompt: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<LLMResponse> {
    if (this.provider === 'openai') {
      return this.callOpenAI(prompt, conversationHistory);
    } else {
      return this.callAnthropic(prompt, conversationHistory);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    prompt: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<LLMResponse> {
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    // Add conversation history
    if (conversationHistory) {
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt,
    });

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: OPENAI_CONFIG.MODEL,
            messages: messages,
            temperature: OPENAI_CONFIG.TEMPERATURE,
            max_tokens: OPENAI_CONFIG.MAX_TOKENS,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: OPENAI_CONFIG.TIMEOUT,
          }
        );

        const content =
          response.data.choices[0]?.message?.content ||
          '抱歉，我無法生成回應。';

        return {
          content: content.trim(),
          usage: {
            promptTokens: response.data.usage?.prompt_tokens,
            completionTokens: response.data.usage?.completion_tokens,
            totalTokens: response.data.usage?.total_tokens,
          },
        };
      } catch (error: unknown) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt === this.maxRetries) {
          throw this.handleError(error);
        }

        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        logger.debug('LLM retry', { attempt, delay, error: String(error) });
        await this.sleep(delay);
      }
    }

    throw this.handleError(lastError || new Error('Unknown error'));
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    prompt: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<LLMResponse> {
    // Build messages array for Anthropic
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (conversationHistory) {
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: ANTHROPIC_CONFIG.MODEL,
            max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS,
            messages: messages,
            system: SYSTEM_PROMPT,
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': ANTHROPIC_CONFIG.API_VERSION,
              'Content-Type': 'application/json',
            },
            timeout: ANTHROPIC_CONFIG.TIMEOUT,
          }
        );

        const content =
          response.data.content[0]?.text || '抱歉，我無法生成回應。';

        return {
          content: content.trim(),
          usage: {
            promptTokens: response.data.usage?.input_tokens,
            completionTokens: response.data.usage?.output_tokens,
            totalTokens:
              (response.data.usage?.input_tokens || 0) +
              (response.data.usage?.output_tokens || 0),
          },
        };
      } catch (error: unknown) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt === this.maxRetries) {
          throw this.handleError(error);
        }

        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        logger.debug('LLM retry', { attempt, delay, error: String(error) });
        await this.sleep(delay);
      }
    }

    throw this.handleError(lastError || new Error('Unknown error'));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    // Type guard for axios errors
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      'code' in error
    ) {
      const axiosError = error as {
        response?: { status?: number };
        code?: string;
      };

      // Rate limit errors (429)
      if (axiosError.response?.status === 429) {
        return true;
      }

      // Network errors
      if (
        axiosError.code === 'ECONNRESET' ||
        axiosError.code === 'ETIMEDOUT'
      ) {
        return true;
      }

      // Server errors (5xx)
      if (
        axiosError.response?.status &&
        axiosError.response.status >= 500 &&
        axiosError.response.status < 600
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
    // Type guard for axios errors
    if (
      error &&
      typeof error === 'object' &&
      ('response' in error || 'code' in error || 'message' in error)
    ) {
      const axiosError = error as {
        response?: { status?: number; data?: { error?: { message?: string } } };
        code?: string;
        message?: string;
      };

      // Rate limit error
      if (axiosError.response?.status === 429) {
        return new LLMRateLimitError(
          'API 請求過於頻繁，請稍後再試。',
          { originalError: axiosError.message }
        );
      }

      // Quota exceeded
      if (
        axiosError.response?.status === 402 ||
        axiosError.response?.status === 403
      ) {
        return new LLMQuotaExceededError(
          'API 配額已用完，請檢查您的帳戶設定。',
          { originalError: axiosError.message }
        );
      }

      // Authentication error
      if (axiosError.response?.status === 401) {
        return new LLMAuthError(
          'API 金鑰無效，請檢查環境變數設定。',
          { originalError: axiosError.message }
        );
      }

      // Network error
      if (
        axiosError.code === 'ECONNRESET' ||
        axiosError.code === 'ETIMEDOUT'
      ) {
        return new LLMNetworkError(
          '網路連線錯誤，請稍後再試。',
          { originalError: axiosError.message }
        );
      }

      // Unknown error with response
      return new LLMError(
        axiosError.response?.data?.error?.message ||
          axiosError.message ||
          '發生未知錯誤',
        'UNKNOWN_ERROR',
        500,
        false,
        { originalError: axiosError }
      );
    }

    // Unknown error without axios structure
    const errorMessage =
      error instanceof Error ? error.message : '發生未知錯誤';
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
export const llmService = new LLMService();

