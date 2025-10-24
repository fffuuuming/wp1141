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

// 地點介面
export interface Location {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 建立地點請求介面
export interface CreateLocationRequest {
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  rating?: number;
  notes?: string;
}

// 更新地點請求介面
export interface UpdateLocationRequest {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  rating?: number;
  notes?: string;
}

// 地點查詢參數介面
export interface LocationQueryParams {
  search?: string;
  category?: string;
  sort?: 'name' | 'rating' | 'created_at';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Google API 回應介面
export interface GeocodeResponse {
  lat: number;
  lng: number;
  formatted_address: string;
}

export interface PlaceSearchResponse {
  places: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    types: string[];
  }>;
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

  // 認證相關 API
  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  }

  async login(emailOrUsername: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/api/auth/login', {
      emailOrUsername,
      password,
    });
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.client.post('/api/auth/logout');
    this.clearToken();
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/api/auth/profile');
    return response.data;
  }

  async updateProfile(data: { username?: string; email?: string }): Promise<ApiResponse<User>> {
    const response = await this.client.put('/api/auth/profile', data);
    return response.data;
  }

  // 地點相關 API
  async getLocations(params?: LocationQueryParams): Promise<ApiResponse<Location[]>> {
    const response = await this.client.get('/api/locations', { params });
    return response.data;
  }

  async getLocation(id: number): Promise<ApiResponse<Location>> {
    const response = await this.client.get(`/api/locations/${id}`);
    return response.data;
  }

  async createLocation(data: CreateLocationRequest): Promise<ApiResponse<Location>> {
    const response = await this.client.post('/api/locations', data);
    return response.data;
  }

  async updateLocation(id: number, data: UpdateLocationRequest): Promise<ApiResponse<Location>> {
    const response = await this.client.put(`/api/locations/${id}`, data);
    return response.data;
  }

  async deleteLocation(id: number): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/locations/${id}`);
    return response.data;
  }

  async getLocationStats(): Promise<ApiResponse<{
    total: number;
    byCategory: Record<string, number>;
    averageRating: number;
  }>> {
    const response = await this.client.get('/api/locations/stats');
    return response.data;
  }

  async addLocationFromGooglePlaces(placeId: string): Promise<ApiResponse<Location>> {
    const response = await this.client.post('/api/locations/google-places', { placeId });
    return response.data;
  }

  // Google API 相關
  async geocode(address: string): Promise<ApiResponse<GeocodeResponse>> {
    const response = await this.client.post('/api/google/geocode', { address });
    return response.data;
  }

  async reverseGeocode(lat: number, lng: number): Promise<ApiResponse<GeocodeResponse>> {
    const response = await this.client.post('/api/google/reverse-geocode', { lat, lng });
    return response.data;
  }

  async searchNearbyPlaces(lat: number, lng: number, radius?: number): Promise<ApiResponse<PlaceSearchResponse>> {
    const response = await this.client.post('/api/google/places/nearby', { lat, lng, radius });
    return response.data;
  }

  async searchPlaces(query: string): Promise<ApiResponse<PlaceSearchResponse>> {
    const response = await this.client.post('/api/google/places/search', { query });
    return response.data;
  }

  async getPlaceDetails(placeId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/api/google/places/details/${placeId}`);
    return response.data;
  }

  async getDirections(origin: string, destination: string): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/google/directions', { origin, destination });
    return response.data;
  }

  async getDistanceMatrix(origins: string[], destinations: string[]): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/google/distance-matrix', { origins, destinations });
    return response.data;
  }
}

// 建立單例實例
export const apiClient = new ApiClient();

// 初始化時載入 token
apiClient.loadToken();

export default apiClient;
