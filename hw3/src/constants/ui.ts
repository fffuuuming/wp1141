// 星期選項
export const WEEKDAYS = ['週一', '週二', '週三', '週四', '週五', '週六'];

// 加選方式選項
export const ADD_METHODS = ['第1類', '第2類', '第3類'];

// 分頁相關常數
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 20, 25, 50],
  MAX_VISIBLE_PAGES: 7,
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 100
} as const;

// UI 相關常數
export const UI_CONFIG = {
  NOTIFICATION_DURATION: 750,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  LOADING_TIMEOUT: 10000
} as const;

// 表格相關常數
export const TABLE_CONFIG = {
  DEFAULT_ROWS_PER_PAGE: 15,
  MAX_ROWS_PER_PAGE: 100,
  MIN_ROWS_PER_PAGE: 5,
  STICKY_HEADER: true,
  DENSE_MODE: false
} as const;

// 主題相關常數
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#1976d2',
  SECONDARY_COLOR: '#dc004e',
  SUCCESS_COLOR: '#4caf50',
  WARNING_COLOR: '#ff9800',
  ERROR_COLOR: '#f44336',
  INFO_COLOR: '#2196f3'
} as const;
