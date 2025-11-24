/**
 * Bot command constants
 * All available bot commands and their aliases
 */

export const COMMANDS = {
  HELP: ['help', '幫助', '說明'],
  CLEAR: ['clear', '清除', '重置'],
  STATS: ['stats', '統計'],
  INFO: ['info', '資訊'],
  MENU: ['主選單', 'menu', '選單'],
} as const;

/**
 * All command strings (flat array for checking)
 */
export const ALL_COMMANDS = [
  ...COMMANDS.HELP,
  ...COMMANDS.CLEAR,
  ...COMMANDS.STATS,
  ...COMMANDS.INFO,
  ...COMMANDS.MENU,
] as const;

/**
 * Check if a message is a command
 */
export function isCommandString(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  return ALL_COMMANDS.some(
    (cmd) => lowerMessage === cmd || lowerMessage.startsWith(cmd + ' ')
  );
}

/**
 * Get command type from message
 */
export function getCommandType(message: string): 'help' | 'stats' | 'info' | 'menu' | null {
  const lowerMessage = message.toLowerCase().trim();

  if (COMMANDS.HELP.some((cmd) => lowerMessage === cmd || lowerMessage.startsWith(cmd + ' '))) {
    return 'help';
  }

  if (COMMANDS.STATS.some((cmd) => lowerMessage === cmd || lowerMessage.startsWith(cmd + ' '))) {
    return 'stats';
  }

  if (COMMANDS.INFO.some((cmd) => lowerMessage === cmd || lowerMessage.startsWith(cmd + ' '))) {
    return 'info';
  }

  if (COMMANDS.MENU.some((cmd) => lowerMessage === cmd || lowerMessage.startsWith(cmd + ' '))) {
    return 'menu';
  }

  return null;
}

