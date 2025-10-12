import { useState, useCallback, useMemo } from 'react';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/app';
import type { NotificationSeverity } from './useNotification';

// 錯誤類型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: NotificationSeverity;
}

// 錯誤處理狀態
interface ErrorState {
  errors: AppError[];
  hasError: boolean;
}

// 錯誤處理 Hook
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    errors: [],
    hasError: false
  });

  // 添加錯誤
  const addError = useCallback((
    code: string,
    message: string,
    details?: any,
    severity: NotificationSeverity = 'error'
  ) => {
    const error: AppError = {
      code,
      message,
      details,
      timestamp: new Date(),
      severity
    };

    setErrorState(prev => ({
      errors: [...prev.errors, error],
      hasError: true
    }));

    // 記錄錯誤到控制台
    console.error(`[${code}] ${message}`, details);
  }, []);

  // 清除錯誤
  const clearError = useCallback((index: number) => {
    setErrorState(prev => ({
      errors: prev.errors.filter((_, i) => i !== index),
      hasError: prev.errors.length > 1
    }));
  }, []);

  // 清除所有錯誤
  const clearAllErrors = useCallback(() => {
    setErrorState({
      errors: [],
      hasError: false
    });
  }, []);

  // 處理網路錯誤
  const handleNetworkError = useCallback((error: any) => {
    addError(
      ERROR_CODES.NETWORK_ERROR,
      ERROR_MESSAGES.NETWORK_ERROR,
      error,
      'error'
    );
  }, [addError]);

  // 處理解析錯誤
  const handleParseError = useCallback((error: any) => {
    addError(
      ERROR_CODES.PARSE_ERROR,
      ERROR_MESSAGES.DATA_LOAD_ERROR,
      error,
      'error'
    );
  }, [addError]);

  // 處理搜尋錯誤
  const handleSearchError = useCallback((error: any) => {
    addError(
      ERROR_CODES.SEARCH_ERROR,
      ERROR_MESSAGES.SEARCH_ERROR,
      error,
      'error'
    );
  }, [addError]);

  // 處理驗證錯誤
  const handleValidationError = useCallback((error: any) => {
    addError(
      ERROR_CODES.VALIDATION_ERROR,
      error.message || '驗證錯誤',
      error,
      'warning'
    );
  }, [addError]);

  // 處理未知錯誤
  const handleUnknownError = useCallback((error: any) => {
    addError(
      ERROR_CODES.UNKNOWN_ERROR,
      ERROR_MESSAGES.UNKNOWN_ERROR,
      error,
      'error'
    );
  }, [addError]);

  // 獲取最新錯誤
  const latestError = useMemo(() => {
    return errorState.errors[errorState.errors.length - 1] || null;
  }, [errorState.errors]);

  // 獲取錯誤統計
  const errorStats = useMemo(() => {
    const stats = {
      total: errorState.errors.length,
      byCode: {} as Record<string, number>,
      bySeverity: {} as Record<NotificationSeverity, number>
    };

    errorState.errors.forEach(error => {
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }, [errorState.errors]);

  return {
    errorState,
    addError,
    clearError,
    clearAllErrors,
    handleNetworkError,
    handleParseError,
    handleSearchError,
    handleValidationError,
    handleUnknownError,
    latestError,
    errorStats
  };
}
