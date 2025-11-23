/**
 * LLM-related constants
 * Model names, parameters, and configuration
 */

/**
 * OpenAI model configuration
 */
export const OPENAI_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 500,
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Anthropic model configuration
 */
export const ANTHROPIC_CONFIG = {
  MODEL: 'claude-3-haiku-20240307',
  MAX_TOKENS: 500,
  TIMEOUT: 30000, // 30 seconds
  API_VERSION: '2023-06-01',
} as const;

/**
 * System prompt for LLM
 */
export const SYSTEM_PROMPT =
  '你是一個友善、有幫助的 AI 助手。請用繁體中文回答問題，回答要簡潔、清晰、有幫助。';

/**
 * Conversation history limit (for context)
 */
export const CONVERSATION_HISTORY_LIMIT = 10;

/**
 * Fallback response templates
 */
export const FALLBACK_RESPONSES = {
  GREETING: '你好！我是你的 AI 助手。目前服務暫時無法使用，但我可以處理基本的問候。有什麼我可以幫你的嗎？',
  QUESTION: (question: string) =>
    `我理解你的問題：「${question}」。目前 AI 服務暫時無法使用，請稍後再試。`,
  DEFAULT: (message: string, error?: string) =>
    `收到你的訊息：「${message}」。目前 AI 服務暫時無法使用（${error || '服務錯誤'}），請稍後再試。`,
} as const;

