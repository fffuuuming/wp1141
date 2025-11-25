/**
 * LLM-related constants
 * Model names, parameters, and configuration
 */

/**
 * OpenAI model configuration
 * 
 * Available models (as of 2024):
 * - gpt-5-nano: Fastest and cheapest, good for simple tasks
 * - gpt-4o-mini: Fast and cost-effective, good balance
 * - gpt-3.5-turbo: Legacy model, still supported
 * - gpt-4o: More capable but more expensive
 * 
 * Pricing reference: https://openai.com/zh-Hant/api/pricing/
 */
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4o-mini', // Fast and cost-effective
  TEMPERATURE: 0.7,
  MAX_TOKENS: 300, // Reduced for faster responses (was 500)
  TIMEOUT: 20000, // 20 seconds (reduced from 30 for faster timeout)
} as const;

/**
 * System prompt for LLM
 */
export const SYSTEM_PROMPT =
  '你是一個專門回答 DeFi（去中心化金融）相關問題的 AI 助手。你的專業領域包括：DeFi 基礎概念、去中心化借貸、去中心化交易所（DEX）、流動性挖礦、流動性池、穩定幣、智能合約、以及 DeFi 相關的風險和最佳實踐。請用繁體中文回答問題，回答要簡潔、清晰、有幫助。如果問題與 DeFi 無關，請禮貌地引導用戶詢問 DeFi 相關的問題。';

/**
 * Conversation history limit (for context)
 */
export const CONVERSATION_HISTORY_LIMIT = 10;

/**
 * RAG (Retrieval-Augmented Generation) Configuration
 */
export const RAG_CONFIG = {
  MAX_CONTEXT_ITEMS: 3, // Maximum number of knowledge base items to include in context
  SIMILARITY_THRESHOLD: 0.7, // Minimum similarity threshold for including knowledge base items
} as const;

/**
 * RAG System Prompt Template
 * This prompt is used when RAG is enabled to guide the LLM to use knowledge base content
 */
export const RAG_SYSTEM_PROMPT = `你是一個專門回答 DeFi（去中心化金融）相關問題的 AI 助手。你的專業領域包括：DeFi 基礎概念、去中心化借貸、去中心化交易所（DEX）、流動性挖礦、流動性池、穩定幣、智能合約、以及 DeFi 相關的風險和最佳實踐。

請根據以下知識庫內容回答使用者的問題。如果知識庫中有相關資訊，請基於這些資訊回答；如果知識庫中沒有相關資訊，請誠實告知，並引導用戶詢問其他 DeFi 相關的問題。

回答要求：
1. 基於知識庫內容，不要編造資訊
2. 簡潔清晰（200字以內）
3. 使用繁體中文
4. 如果知識庫沒有相關資訊，誠實告知並建議相關問題`;

/**
 * Fallback response templates
 */
export const FALLBACK_RESPONSES = {
  GREETING: '你好！我是你的 AI 助手。目前服務暫時無法使用，但我可以處理基本的問候。有什麼我可以幫你的嗎？',
  QUESTION: (question: string) =>
    `我理解你的問題：「${question}」。目前 AI 服務暫時無法使用，請稍後再試。`,
  DEFAULT: (message: string) =>
    `收到你的訊息：「${message}」。目前 AI 服務暫時無法使用，請稍後再試。`,
} as const;

