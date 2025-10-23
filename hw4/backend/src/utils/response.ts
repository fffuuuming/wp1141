import { Response } from 'express';

// 成功回應介面
interface SuccessResponse<T = any> {
  message: string;
  data?: T;
  count?: number;
  timestamp: string;
}

// 分頁回應介面
interface PaginatedResponse<T = any> {
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// 成功回應工具
export function sendSuccess<T>(
  res: Response,
  statusCode: number = 200,
  message: string,
  data?: T,
  count?: number
): void {
  const response: SuccessResponse<T> = {
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (count !== undefined) {
    response.count = count;
  }

  res.status(statusCode).json(response);
}

// 分頁回應工具
export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number
): void {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
}

// 建立回應工具
export function sendCreated<T>(
  res: Response,
  message: string,
  data: T
): void {
  sendSuccess(res, 201, message, data);
}

// 無內容回應
export function sendNoContent(res: Response, message: string): void {
  sendSuccess(res, 204, message);
}

// 常用回應訊息
export const ResponseMessages = {
  // 認證相關
  LOGIN_SUCCESS: '登入成功',
  LOGOUT_SUCCESS: '登出成功',
  REGISTER_SUCCESS: '註冊成功',
  PROFILE_UPDATED: '個人資料更新成功',
  
  // 地點相關
  LOCATION_CREATED: '地點建立成功',
  LOCATION_UPDATED: '地點更新成功',
  LOCATION_DELETED: '地點刪除成功',
  LOCATIONS_FETCHED: '地點清單取得成功',
  LOCATION_FETCHED: '地點取得成功',
  
  // Google API 相關
  GEOCODE_SUCCESS: '地址轉座標成功',
  REVERSE_GEOCODE_SUCCESS: '座標轉地址成功',
  PLACES_SEARCH_SUCCESS: '地點搜尋成功',
  DIRECTIONS_SUCCESS: '路線計算成功',
  
  // 統計相關
  STATS_FETCHED: '統計資料取得成功'
} as const;
