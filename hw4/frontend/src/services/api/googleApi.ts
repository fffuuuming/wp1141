/**
 * Google API 相關
 * 處理 Google Maps、Places 等功能
 */

import { apiClient, type ApiResponse } from './baseClient';

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

export interface PlaceDetailsResponse {
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
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

export interface DirectionsResponse {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: Array<{
        html_instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }>;
    }>;
  }>;
}

export interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
      status: string;
    }>;
  }>;
}

// Google API 請求介面
export interface GeocodeRequest {
  address: string;
}

export interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}

export interface NearbyPlacesRequest {
  lat: number;
  lng: number;
  radius?: number;
}

export interface PlaceSearchRequest {
  query: string;
}

export interface DirectionsRequest {
  origin: string;
  destination: string;
}

export interface DistanceMatrixRequest {
  origins: string[];
  destinations: string[];
}

class GoogleApi {
  private client = apiClient.getClient();

  /**
   * 地址轉座標
   */
  async geocode(address: string): Promise<ApiResponse<GeocodeResponse>> {
    const response = await this.client.post('/api/google/geocode', { address });
    return response.data;
  }

  /**
   * 座標轉地址
   */
  async reverseGeocode(lat: number, lng: number): Promise<ApiResponse<GeocodeResponse>> {
    const response = await this.client.post('/api/google/reverse-geocode', { lat, lng });
    return response.data;
  }

  /**
   * 搜尋附近地點
   */
  async searchNearbyPlaces(lat: number, lng: number, radius?: number): Promise<ApiResponse<PlaceSearchResponse>> {
    const response = await this.client.post('/api/google/places/nearby', { lat, lng, radius });
    return response.data;
  }

  /**
   * 文字搜尋地點
   */
  async searchPlaces(query: string): Promise<ApiResponse<PlaceSearchResponse>> {
    const response = await this.client.post('/api/google/places/search', { query });
    return response.data;
  }

  /**
   * 取得地點詳細資訊
   */
  async getPlaceDetails(placeId: string): Promise<ApiResponse<PlaceDetailsResponse>> {
    const response = await this.client.get(`/api/google/places/details/${placeId}`);
    return response.data;
  }

  /**
   * 計算路線
   */
  async getDirections(origin: string, destination: string): Promise<ApiResponse<DirectionsResponse>> {
    const response = await this.client.post('/api/google/directions', { origin, destination });
    return response.data;
  }

  /**
   * 計算距離矩陣
   */
  async getDistanceMatrix(origins: string[], destinations: string[]): Promise<ApiResponse<DistanceMatrixResponse>> {
    const response = await this.client.post('/api/google/distance-matrix', { origins, destinations });
    return response.data;
  }
}

// 建立單例實例
export const googleApi = new GoogleApi();

export default googleApi;
