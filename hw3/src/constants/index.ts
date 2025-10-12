// 課程相關常數
export {
  TIME_SLOTS,
  COLLEGE_OPTIONS,
  DEPARTMENT_OPTIONS,
  COURSE_TYPE_OPTIONS
} from './course';

// 搜尋相關常數
export {
  SEARCH_METHOD_OPTIONS,
  SearchMethod,
  SEARCH_CONFIG,
  SEARCH_RESULTS_CONFIG
} from './search';

// UI 相關常數
export {
  WEEKDAYS,
  ADD_METHODS,
  PAGINATION_CONFIG,
  UI_CONFIG,
  TABLE_CONFIG,
  THEME_CONFIG
} from './ui';

// 應用程式相關常數
export {
  APP_CONFIG,
  API_CONFIG,
  FILE_PATHS,
  ENV_CONFIG,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from './app';

// 向後兼容的導出
export const DEFAULT_PAGE_SIZE = 15;
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 50];
export const CSV_FILE_PATH = '/hw3-ntucourse-data-1002.csv';
