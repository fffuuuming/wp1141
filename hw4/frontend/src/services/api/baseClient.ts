/**
 * 基礎 API 客戶端
 * 提供通用的 HTTP 客戶端配置和攔截器
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// API 回應介面
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  timestamp: string;
}

// 錯誤回應介面
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  details?: any;
}

// API 客戶端類別
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 請求攔截器 - 自動添加認證 token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 回應攔截器 - 統一錯誤處理
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token 過期或無效，清除本地 token
          this.clearToken();
          // 可以觸發登出事件
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(error);
      }
    );
  }

  // 設定認證 token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // 清除認證 token
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // 從 localStorage 載入 token
  loadToken(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.token = token;
    }
  }

  // 獲取底層 axios 實例（供其他 API 模組使用）
  getClient(): AxiosInstance {
    return this.client;
  }
}

// 建立單例實例
export const apiClient = new ApiClient();

// 初始化時載入 token
apiClient.loadToken();

export default apiClient;
