import { useState, useCallback } from 'react';

export type NotificationSeverity = 'success' | 'warning' | 'error' | 'info';

interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
}

// 通知 Hook
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message: string, severity: NotificationSeverity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showWarning,
    showError
  };
}
