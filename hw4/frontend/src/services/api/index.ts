/**
 * API 服務統一入口
 * 重新導出所有 API 模組，保持向後兼容
 */

// 基礎客戶端
export { apiClient, type ApiResponse, type ApiError } from './baseClient';

// 認證 API
export { authApi, type AuthResponse, type User, type RegisterRequest, type LoginRequest, type UpdateProfileRequest } from './authApi';

// 地點 API
export { locationApi, type Location, type CreateLocationRequest, type UpdateLocationRequest, type LocationQueryParams, type LocationStats } from './locationApi';

// Google API
export { googleApi, type GeocodeResponse, type PlaceSearchResponse, type PlaceDetailsResponse, type DirectionsResponse, type DistanceMatrixResponse } from './googleApi';
