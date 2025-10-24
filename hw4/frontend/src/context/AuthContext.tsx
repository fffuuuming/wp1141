import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/api';
import type { User } from '../services/api';

// 認證狀態介面
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 認證 Context 介面
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string; email?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// 建立 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認證 Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// 認證 Provider 組件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 初始化認證狀態
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 載入本地 token
        apiClient.loadToken();
        
        // 嘗試取得使用者資料
        const response = await apiClient.getProfile();
        setAuthState({
          user: response.data,
          token: localStorage.getItem('auth_token'),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // 如果取得使用者資料失敗，清除認證狀態
        apiClient.clearToken();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // 監聽登出事件
  useEffect(() => {
    const handleLogout = () => {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // 登入函數
  const login = async (emailOrUsername: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.login(emailOrUsername, password);
      const { token, user } = response.data;
      
      apiClient.setToken(token);
      
      setAuthState({
        user: {
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // 註冊函數
  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.register(username, email, password);
      const { token, user } = response.data;
      
      apiClient.setToken(token);
      
      setAuthState({
        user: {
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // 登出函數
  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      // 即使登出 API 失敗，也要清除本地狀態
      console.error('Logout API failed:', error);
    } finally {
      apiClient.clearToken();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // 更新使用者資料
  const updateProfile = async (data: { username?: string; email?: string }): Promise<void> => {
    try {
      const response = await apiClient.updateProfile(data);
      setAuthState(prev => ({
        ...prev,
        user: response.data,
      }));
    } catch (error) {
      throw error;
    }
  };

  // 重新整理使用者資料
  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await apiClient.getProfile();
      setAuthState(prev => ({
        ...prev,
        user: response.data,
      }));
    } catch (error) {
      // 如果重新整理失敗，可能需要重新登入
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用認證 Context 的 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 受保護路由的 Hook
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
  };
};

export default AuthContext;
