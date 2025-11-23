import connectDB from '@/lib/utils/mongodb';
import { User, Conversation } from '@/lib/models';
import { sendTextMessage, getUserProfile } from './lineService';

/**
 * Handle user follow event (when user adds bot as friend)
 */
export async function handleFollowEvent(
  userId: string,
  replyToken: string
): Promise<void> {
  try {
    await connectDB();

    // Get or create user
    let user = await User.findOne({ lineUserId: userId });

    if (!user) {
      // Get user profile from Line
      const profile = await getUserProfile(userId);

      // Create new user
      user = await User.create({
        lineUserId: userId,
        displayName: profile?.displayName,
        pictureUrl: profile?.pictureUrl,
        statusMessage: profile?.statusMessage,
        lastActiveAt: new Date(),
        messageCount: 0,
      });
    }

    // Send welcome message
    const welcomeMessage = getWelcomeMessage(user.displayName || '朋友');
    await sendTextMessage(replyToken, welcomeMessage);

    console.log(`Welcome message sent to ${userId}`);
  } catch (error) {
    console.error('Error handling follow event:', error);
    // Try to send error message
    try {
      await sendTextMessage(
        replyToken,
        '歡迎使用！我是你的 AI 助手，很高興認識你！'
      );
    } catch (sendError) {
      console.error('Error sending welcome message:', sendError);
    }
  }
}

/**
 * Handle user unfollow event (when user blocks bot)
 */
export async function handleUnfollowEvent(userId: string): Promise<void> {
  try {
    await connectDB();

    // Mark all active conversations as inactive
    await Conversation.updateMany(
      { lineUserId: userId, isActive: true },
      {
        $set: {
          isActive: false,
          endedAt: new Date(),
        },
      }
    );

    console.log(`Marked conversations as inactive for ${userId}`);
  } catch (error) {
    console.error('Error handling unfollow event:', error);
  }
}

/**
 * Get welcome message
 */
function getWelcomeMessage(userName: string): string {
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
 * Check if message is a command
 */
export function isCommand(message: string): boolean {
  const commands = [
    'help',
    '幫助',
    '說明',
    'clear',
    '清除',
    '重置',
    'stats',
    '統計',
    'info',
    '資訊',
  ];
  const lowerMessage = message.toLowerCase().trim();
  return commands.some((cmd) => lowerMessage === cmd || lowerMessage.startsWith(cmd + ' '));
}

/**
 * Handle special commands
 */
export async function handleCommand(
  command: string,
  userId: string,
  replyToken: string
): Promise<string | null> {
  const lowerCommand = command.toLowerCase().trim();

  // Help command
  if (lowerCommand === 'help' || lowerCommand === '幫助' || lowerCommand === '說明') {
    return getHelpMessage();
  }

  // Stats command (for user's own stats)
  if (lowerCommand === 'stats' || lowerCommand === '統計') {
    try {
      await connectDB();
      const user = await User.findOne({ lineUserId: userId }).lean();
      if (user) {
        const conversationCount = await Conversation.countDocuments({
          userId: user._id,
        });
        return `📊 你的統計資訊：

💬 總訊息數：${user.messageCount}
📝 對話數：${conversationCount}
🕐 最後活躍：${new Date(user.lastActiveAt).toLocaleString('zh-TW')}`;
      }
    } catch (error) {
      console.error('Error getting user stats:', error);
    }
    return '無法取得統計資訊，請稍後再試。';
  }

  // Info command
  if (lowerCommand === 'info' || lowerCommand === '資訊') {
    return `ℹ️ 關於我：

我是 AI 聊天助手，使用先進的語言模型來提供智能對話服務。

功能：
• 回答問題
• 提供資訊
• 進行對話
• 協助解決問題

輸入 "help" 查看完整說明。`;
  }

  // Unknown command
  return null;
}

/**
 * Get help message
 */
function getHelpMessage(): string {
  return `📖 使用說明

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
}

