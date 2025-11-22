import axios from 'axios';
import { config } from '@/lib/config';

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface LLMError {
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
        content:
          '你是一個友善、有幫助的 AI 助手。請用繁體中文回答問題，回答要簡潔、清晰、有幫助。',
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

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
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
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt === this.maxRetries) {
          throw this.handleError(error);
        }

        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
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

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-haiku-20240307',
            max_tokens: 500,
            messages: messages,
            system:
              '你是一個友善、有幫助的 AI 助手。請用繁體中文回答問題，回答要簡潔、清晰、有幫助。',
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
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
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt === this.maxRetries) {
          throw this.handleError(error);
        }

        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw this.handleError(lastError || new Error('Unknown error'));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Rate limit errors (429)
    if (error.response?.status === 429) {
      return true;
    }

    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // Server errors (5xx)
    if (error.response?.status >= 500 && error.response?.status < 600) {
      return true;
    }

    return false;
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): LLMError {
    // Rate limit error
    if (error.response?.status === 429) {
      return {
        code: 'RATE_LIMIT',
        message: 'API 請求過於頻繁，請稍後再試。',
        retryable: true,
      };
    }

    // Quota exceeded
    if (error.response?.status === 402 || error.response?.status === 403) {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'API 配額已用完，請檢查您的帳戶設定。',
        retryable: false,
      };
    }

    // Authentication error
    if (error.response?.status === 401) {
      return {
        code: 'AUTH_ERROR',
        message: 'API 金鑰無效，請檢查環境變數設定。',
        retryable: false,
      };
    }

    // Network error
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return {
        code: 'NETWORK_ERROR',
        message: '網路連線錯誤，請稍後再試。',
        retryable: true,
      };
    }

    // Unknown error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || error.message || '發生未知錯誤',
      retryable: false,
    };
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

