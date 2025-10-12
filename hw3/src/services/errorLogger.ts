import { ERROR_CODES } from '../constants/app';

// 錯誤日誌級別
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

// 錯誤日誌級別類型
export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

// 錯誤日誌條目
export interface LogEntry {
  id: string;
  level: LogLevelType;
  message: string;
  timestamp: Date;
  context?: any;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

// 錯誤日誌服務類
class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 記錄日誌
  private log(level: LogLevelType, message: string, context?: any, error?: Error): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      level,
      message,
      timestamp: new Date(),
      context,
      stack: error?.stack,
      sessionId: this.sessionId
    };

    this.logs.push(logEntry);

    // 保持日誌數量在限制內
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 根據級別輸出到控制台
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${level.toUpperCase()}] ${message}`, context);
        break;
      case LogLevel.INFO:
        console.info(`[${level.toUpperCase()}] ${message}`, context);
        break;
      case LogLevel.WARN:
        console.warn(`[${level.toUpperCase()}] ${message}`, context);
        break;
      case LogLevel.ERROR:
        console.error(`[${level.toUpperCase()}] ${message}`, context, error);
        break;
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 記錄調試信息
  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // 記錄一般信息
  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  // 記錄警告
  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  // 記錄錯誤
  error(message: string, error?: Error, context?: any): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // 記錄網路錯誤
  logNetworkError(error: any, context?: any): void {
    this.error(`網路錯誤: ${error.message || '未知網路錯誤'}`, error, {
      ...context,
      errorCode: ERROR_CODES.NETWORK_ERROR,
      type: 'network'
    });
  }

  // 記錄搜尋錯誤
  logSearchError(error: any, context?: any): void {
    this.error(`搜尋錯誤: ${error.message || '未知搜尋錯誤'}`, error, {
      ...context,
      errorCode: ERROR_CODES.SEARCH_ERROR,
      type: 'search'
    });
  }

  // 記錄解析錯誤
  logParseError(error: any, context?: any): void {
    this.error(`解析錯誤: ${error.message || '未知解析錯誤'}`, error, {
      ...context,
      errorCode: ERROR_CODES.PARSE_ERROR,
      type: 'parse'
    });
  }

  // 記錄驗證錯誤
  logValidationError(error: any, context?: any): void {
    this.warn(`驗證錯誤: ${error.message || '未知驗證錯誤'}`, {
      ...context,
      errorCode: ERROR_CODES.VALIDATION_ERROR,
      type: 'validation'
    });
  }

  // 獲取所有日誌
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // 獲取錯誤日誌
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.ERROR);
  }

  // 獲取警告日誌
  getWarningLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.WARN);
  }

  // 清除所有日誌
  clearLogs(): void {
    this.logs = [];
  }

  // 導出日誌
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // 獲取日誌統計
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevelType, number>;
    byType: Record<string, number>;
    recentErrors: number;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<LogLevelType, number>,
      byType: {} as Record<string, number>,
      recentErrors: 0
    };

    // 統計各級別日誌數量
    Object.values(LogLevel).forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
    });

    // 統計各類型錯誤數量
    this.logs.forEach(log => {
      if (log.context?.type) {
        stats.byType[log.context.type] = (stats.byType[log.context.type] || 0) + 1;
      }
    });

    // 統計最近24小時的錯誤數量
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    stats.recentErrors = this.logs.filter(
      log => log.level === LogLevel.ERROR && log.timestamp > oneDayAgo
    ).length;

    return stats;
  }
}

// 導出單例實例
export const errorLogger = new ErrorLogger();

// 導出便捷函數
export const logError = (message: string, error?: Error, context?: any) => 
  errorLogger.error(message, error, context);

export const logWarning = (message: string, context?: any) => 
  errorLogger.warn(message, context);

export const logInfo = (message: string, context?: any) => 
  errorLogger.info(message, context);

export const logDebug = (message: string, context?: any) => 
  errorLogger.debug(message, context);
