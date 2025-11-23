import { AppError } from './AppError';

/**
 * LLM API errors
 */
export class LLMError extends AppError {
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string = 'LLM_ERROR',
    statusCode: number = 500,
    retryable: boolean = false,
    details?: unknown
  ) {
    super(message, code, statusCode, true, details);
    this.retryable = retryable;
  }
}

/**
 * LLM rate limit error
 */
export class LLMRateLimitError extends LLMError {
  constructor(message: string = 'API 請求過於頻繁，請稍後再試。', details?: unknown) {
    super(message, 'RATE_LIMIT', 429, true, details);
  }
}

/**
 * LLM quota exceeded error
 */
export class LLMQuotaExceededError extends LLMError {
  constructor(message: string = 'API 配額已用完，請檢查您的帳戶設定。', details?: unknown) {
    super(message, 'QUOTA_EXCEEDED', 402, false, details);
  }
}

/**
 * LLM authentication error
 */
export class LLMAuthError extends LLMError {
  constructor(message: string = 'API 金鑰無效，請檢查環境變數設定。', details?: unknown) {
    super(message, 'AUTH_ERROR', 401, false, details);
  }
}

/**
 * LLM network error
 */
export class LLMNetworkError extends LLMError {
  constructor(message: string = '網路連線錯誤，請稍後再試。', details?: unknown) {
    super(message, 'NETWORK_ERROR', 500, true, details);
  }
}

