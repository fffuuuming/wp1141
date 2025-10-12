import type { CourseData, CourseType } from './course';
import type { FilterType } from './common';

// 搜尋方法類型
export type SearchMethod = 'courseName' | 'teacherName' | 'courseCode' | 'serialNumber' | 'courseId';

// 搜尋過濾器介面
export interface SearchFilters {
  timeFilter: FilterType;
  periodFilter: FilterType;
  addMethodFilter: FilterType;
  pageSize: number;
  // 選中的星期選項
  selectedWeekdays: string[];
  // 選中的節次選項
  selectedPeriods: string[];
  // 選中的加選方式選項
  selectedAddMethods: string[];
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
