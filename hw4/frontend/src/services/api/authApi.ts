/**
 * 認證相關 API
 * 處理使用者登入、註冊、登出等功能
 */

import { apiClient, type ApiResponse } from './baseClient';

// 認證回應介面
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// 使用者介面
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// 註冊請求介面
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 登入請求介面
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

// 更新使用者資料請求介面
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

class AuthApi {
  private client = apiClient.getClient();

  /**
   * 使用者註冊
   */
  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  }

  /**
   * 使用者登入
   */
  async login(emailOrUsername: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/api/auth/login', {
      emailOrUsername,
      password,
    });
    return response.data;
  }

  /**
   * 使用者登出
   */
  async logout(): Promise<ApiResponse> {
    const response = await this.client.post('/api/auth/logout');
    apiClient.clearToken();
    return response.data;
  }

  /**
   * 取得使用者資料
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/api/auth/profile');
    return response.data;
  }

  /**
   * 更新使用者資料
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await this.client.put('/api/auth/profile', data);
    return response.data;
  }
}

// 建立單例實例
export const authApi = new AuthApi();

export default authApi;
