import { APP_CONFIG, ENV_CONFIG, FILE_PATHS } from '../constants/app';
import { THEME_CONFIG } from '../constants/ui';

// 應用程式配置
export const appConfig = {
  ...APP_CONFIG,
  ...ENV_CONFIG,
  theme: THEME_CONFIG,
  files: FILE_PATHS,
  
  // 功能開關
  features: {
    enableSearchCache: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: ENV_CONFIG.IS_DEVELOPMENT,
    enableDebugLogs: ENV_CONFIG.IS_DEVELOPMENT
  },
  
  // 性能配置
  performance: {
    searchDebounceDelay: 300,
    maxSearchResults: 1000,
    cacheExpirationTime: 5 * 60 * 1000, // 5 分鐘
    maxCacheSize: 100
  },
  
  // UI 配置
  ui: {
    defaultPageSize: 15,
    maxPageSize: 100,
    notificationDuration: 3000,
    animationDuration: 200
  }
} as const;

// 導出類型
export type AppConfig = typeof appConfig;
export type FeatureFlags = typeof appConfig.features;
export type PerformanceConfig = typeof appConfig.performance;
export type UIConfig = typeof appConfig.ui;
