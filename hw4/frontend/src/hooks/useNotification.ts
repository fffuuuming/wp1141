/**
 * 通知管理 Hook
 * 處理成功訊息、錯誤訊息和路由狀態訊息
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseNotificationReturn {
  successMessage: string | null;
  errorMessage: string | null;
  setSuccessMessage: (message: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  clearSuccessMessage: () => void;
  clearErrorMessage: () => void;
  clearAllMessages: () => void;
}

export const useNotification = (autoClearDelay: number = 3000): UseNotificationReturn => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 處理路由狀態中的訊息
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // 清除 state 中的訊息
      window.history.replaceState({}, document.title);
      
      // 自動清除訊息
      if (autoClearDelay > 0) {
        const timer = setTimeout(() => {
          setSuccessMessage(null);
        }, autoClearDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [location.state, autoClearDelay]);

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  const clearErrorMessage = () => {
    setErrorMessage(null);
  };

  const clearAllMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return {
    successMessage,
    errorMessage,
    setSuccessMessage,
    setErrorMessage,
    clearSuccessMessage,
    clearErrorMessage,
    clearAllMessages,
  };
};
