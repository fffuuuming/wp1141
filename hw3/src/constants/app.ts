import { isDevelopment, isProduction, isTest } from '../utils/env';

// 應用程式配置
export const APP_CONFIG = {
  NAME: '台大課程網',
  VERSION: '1.0.0',
  DESCRIPTION: '台大課程查詢系統',
  AUTHOR: 'NTU Course System',
  COPYRIGHT: '© 2024 National Taiwan University'
} as const;

// API 相關常數
export const API_CONFIG = {
  BASE_URL: isProduction() ? '/api' : 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// 文件路徑
export const FILE_PATHS = {
  CSV_DATA: '/hw3-ntucourse-data-1002.csv',
  REGISTRATION_CODES: '/ntu_regquery_codes.csv',
  CODE_DATA: '/code.csv'
} as const;

// 環境配置
export const ENV_CONFIG = {
  IS_DEVELOPMENT: isDevelopment(),
  IS_PRODUCTION: isProduction(),
  IS_TEST: isTest()
} as const;

// 錯誤代碼
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SEARCH_ERROR: 'SEARCH_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// 成功訊息
export const SUCCESS_MESSAGES = {
  COURSE_ADDED: '課程加入成功',
  COURSE_REMOVED: '課程移除成功',
  SEARCH_COMPLETED: '搜尋完成',
  DATA_LOADED: '數據載入成功'
} as const;

// 錯誤訊息
export const ERROR_MESSAGES = {
  COURSE_ALREADY_SELECTED: '此課程已經選擇',
  NETWORK_ERROR: '網路連線錯誤',
  DATA_LOAD_ERROR: '數據載入失敗',
  SEARCH_ERROR: '搜尋發生錯誤',
  UNKNOWN_ERROR: '發生未知錯誤'
} as const;
