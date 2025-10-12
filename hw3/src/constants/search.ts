// 搜尋方法選項
export const SEARCH_METHOD_OPTIONS = [
  { value: 'courseName', label: '課程名稱' },
  { value: 'teacherName', label: '教師姓名' },
  { value: 'courseCode', label: '課號' },
  { value: 'serialNumber', label: '流水號' },
  { value: 'courseId', label: '課程識別碼' }
];

// 搜尋相關的常數
export const SearchMethod = {
  COURSE_NAME: 'courseName',
  TEACHER_NAME: 'teacherName',
  COURSE_CODE: 'courseCode',
  SERIAL_NUMBER: 'serialNumber',
  COURSE_ID: 'courseId'
} as const;

// 搜尋配置
export const SEARCH_CONFIG = {
  MIN_KEYWORD_LENGTH: 1,
  MAX_KEYWORD_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
  CACHE_DURATION: 5 * 60 * 1000, // 5 分鐘
  MAX_CACHE_SIZE: 100
} as const;

// 搜尋結果配置
export const SEARCH_RESULTS_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5
} as const;
