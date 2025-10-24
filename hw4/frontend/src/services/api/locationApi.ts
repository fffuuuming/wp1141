/**
 * 地點相關 API
 * 處理地點的 CRUD 操作
 */

import { apiClient, type ApiResponse } from './baseClient';

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

// 地點統計介面
export interface LocationStats {
  total: number;
  byCategory: Record<string, number>;
  averageRating: number;
}

class LocationApi {
  private client = apiClient.getClient();

  /**
   * 取得地點清單
   */
  async getLocations(params?: LocationQueryParams): Promise<ApiResponse<Location[]>> {
    const response = await this.client.get('/api/locations', { params });
    return response.data;
  }

  /**
   * 取得特定地點
   */
  async getLocation(id: number): Promise<ApiResponse<Location>> {
    const response = await this.client.get(`/api/locations/${id}`);
    return response.data;
  }

  /**
   * 新增地點
   */
  async createLocation(data: CreateLocationRequest): Promise<ApiResponse<Location>> {
    const response = await this.client.post('/api/locations', data);
    return response.data;
  }

  /**
   * 更新地點
   */
  async updateLocation(id: number, data: UpdateLocationRequest): Promise<ApiResponse<Location>> {
    const response = await this.client.put(`/api/locations/${id}`, data);
    return response.data;
  }

  /**
   * 刪除地點
   */
  async deleteLocation(id: number): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/locations/${id}`);
    return response.data;
  }

  /**
   * 取得地點統計
   */
  async getLocationStats(): Promise<ApiResponse<LocationStats>> {
    const response = await this.client.get('/api/locations/stats/summary');
    return response.data;
  }

  /**
   * 從 Google Places 新增地點
   */
  async addLocationFromGooglePlaces(placeId: string): Promise<ApiResponse<Location>> {
    const response = await this.client.post('/api/locations/google-places', { placeId });
    return response.data;
  }
}

// 建立單例實例
export const locationApi = new LocationApi();

export default locationApi;
