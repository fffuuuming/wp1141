/**
 * Bot-related constants
 * Messages, templates, and bot configuration
 */

/**
 * Welcome message template
 */
export function getWelcomeMessage(userName: string): string {
  return `你好 ${userName}！👋

歡迎使用 DeFi 知識助手！我是專門回答去中心化金融（DeFi）相關問題的 AI 助手。

我可以幫助你了解：

💎 DeFi 基礎概念
🏦 去中心化借貸
💱 去中心化交易所（DEX）
🌾 流動性挖礦與流動性池
💵 穩定幣
📜 智能合約
⚠️ DeFi 風險與最佳實踐

你可以直接問我任何 DeFi 相關的問題，我會盡力幫助你！

輸入 "help" 或 "幫助" 可以查看使用說明。`;
}

/**
 * Help message
 */
export const HELP_MESSAGE = `📖 使用說明

我是專門回答 DeFi（去中心化金融）相關問題的 AI 助手。

我可以幫助你了解：
• DeFi 基礎概念（什麼是 DeFi、去中心化等）
• 去中心化借貸（借貸協議、利率等）
• 去中心化交易所（DEX、AMM、交易等）
• 流動性挖礦與流動性池
• 穩定幣（USDT、USDC、DAI 等）
• 智能合約與 DeFi 協議
• DeFi 風險與安全最佳實踐

可用指令：
• help / 幫助 - 顯示此說明
• stats / 統計 - 查看你的統計資訊
• info / 資訊 - 關於此助手

直接輸入 DeFi 相關問題，我會盡力回答你！`;

/**
 * Info message
 */
export const INFO_MESSAGE = `ℹ️ 關於我：

我是專門回答 DeFi（去中心化金融）相關問題的 AI 助手，使用先進的語言模型來提供專業的 DeFi 知識服務。

我的專業領域：
• DeFi 基礎概念與原理
• 去中心化借貸與借貸協議
• 去中心化交易所（DEX）與自動做市商（AMM）
• 流動性挖礦與流動性池機制
• 穩定幣與 DeFi 代幣
• 智能合約與 DeFi 協議運作
• DeFi 風險管理與安全實踐

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

