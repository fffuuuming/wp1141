// 課程數據介面
export interface CourseData {
  yyse: string;
  ser_no: string;
  co_chg: string;
  dpt_code: string;
  year: string;
  cou_code: string;
  class: string;
  credit: string;
  tlec: string;
  tlab: string;
  forh: string;
  sel_code: string;
  cou_cname: string;
  cou_ename: string;
  tea_seq: string;
  tea_code: string;
  tea_cname: string;
  tea_ename: string;
  clsrom_1: string;
  clsrom_2: string;
  clsrom_3: string;
  clsrom_4: string;
  clsrom_5: string;
  clsrom_6: string;
  st1: string;
  day1: string;
  st2: string;
  day2: string;
  st3: string;
  day3: string;
  st4: string;
  day4: string;
  st5: string;
  day5: string;
  st6: string;
  day6: string;
  limit: string;
  tno: string;
  eno: string;
  co_select: string;
  sno: string;
  mark: string;
  co_rep: string;
  co_tp: string;
  co_gmark: string;
  co_eng: string;
  grpno: string;
  initsel: string;
  outside: string;
  pre_course: string;
  dpt_abbr: string;
  cou_teacno: string;
  chgitem: string;
  engmark: string;
}

// 搜尋方法類型
export type SearchMethod = 'courseName' | 'teacherName' | 'courseCode' | 'serialNumber' | 'courseId';

// 過濾器類型
export type FilterType = 'unlimited' | 'limited';

// 課程類型
export type CourseType = 'required' | 'elective' | 'all';

// 時間槽介面
export interface TimeSlot {
  value: string;
  time: string;
}

// 學院選項介面
export interface CollegeOption {
  code: string;
  name: string;
}

// 系所選項介面
export interface DepartmentOption {
  code: string;
  name: string;
}

// 搜尋過濾器介面
export interface SearchFilters {
  timeFilter: FilterType;
  periodFilter: FilterType;
  addMethodFilter: FilterType;
  pageSize: number;
}

// 快速搜尋狀態介面
export interface QuickSearchState {
  searchMethod: SearchMethod;
  keyword: string;
  filters: SearchFilters;
}

// 系所搜尋狀態介面
export interface DepartmentSearchState {
  college: string;
  department: string;
  requirementType: CourseType;
  filters: SearchFilters;
}

// 應用程式狀態介面
export interface AppState {
  searchResults: CourseData[];
  isLoading: boolean;
  currentPage: number;
  courses: CourseData[];
}

// 分頁資訊介面
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
