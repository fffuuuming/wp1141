/**
 * Bot-related constants
 * Messages, templates, and bot configuration
 */

/**
 * Welcome message template
 */
export function getWelcomeMessage(userName: string): string {
  return `你好 ${userName}！👋

歡迎使用 AI 聊天助手！我是你的智能助手，可以幫助你：

✨ 回答問題
📚 提供資訊
💬 進行對話
🎯 協助解決問題

你可以直接問我任何問題，我會盡力幫助你！

輸入 "help" 或 "幫助" 可以查看使用說明。`;
}

/**
 * Help message
 */
export const HELP_MESSAGE = `📖 使用說明

我可以幫助你：
• 回答各種問題
• 提供資訊和建議
• 進行自然對話
• 協助解決問題

可用指令：
• help / 幫助 - 顯示此說明
• stats / 統計 - 查看你的統計資訊
• info / 資訊 - 關於此助手

直接輸入問題或訊息，我會盡力回答你！`;

/**
 * Info message
 */
export const INFO_MESSAGE = `ℹ️ 關於我：

我是 AI 聊天助手，使用先進的語言模型來提供智能對話服務。

功能：
• 回答問題
• 提供資訊
• 進行對話
• 協助解決問題

輸入 "help" 查看完整說明。`;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  PROCESSING_ERROR: '抱歉，處理您的訊息時發生錯誤，請稍後再試。',
  WELCOME_FALLBACK: '歡迎使用！我是你的 AI 助手，很高興認識你！',
  STATS_ERROR: '無法取得統計資訊，請稍後再試。',
  LLM_ERROR: '抱歉，AI 服務暫時無法使用，請稍後再試或聯繫管理員。',
} as const;

