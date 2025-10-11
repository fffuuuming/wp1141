import { useCallback } from 'react';
import type { CourseData, SearchMethod } from '../types';
import {
  searchCoursesByName,
  searchCoursesByTeacher,
  searchCoursesByCode,
  searchCoursesBySerialNumber,
  searchCoursesById
} from '../utils/csvParser';
import { useCourseFilters } from './useCourseFilters';

// 共用的搜尋邏輯 Hook
export function useSearchLogic() {
  const { applyFilters } = useCourseFilters();

  const performSearch = useCallback((
    courses: CourseData[],
    searchMethod: SearchMethod,
    keyword: string,
    filters: {
      timeFilter: string;
      periodFilter: string;
      addMethodFilter: string;
      selectedWeekdays: string[];
      selectedPeriods: string[];
      selectedAddMethods: string[];
    }
  ): CourseData[] => {
    console.log('執行搜尋:', { searchMethod, keyword, filters });
    console.log('可用課程數量:', courses.length);
    
    if (!keyword.trim()) {
      console.log('關鍵字為空，清空結果');
      return [];
    }

    let results: CourseData[] = [];
    
    switch (searchMethod) {
      case 'courseName':
        console.log('使用課程名稱搜尋:', keyword);
        results = searchCoursesByName(courses, keyword);
        console.log('課程名稱搜尋結果:', results.length, '筆');
        break;
      case 'teacherName':
        results = searchCoursesByTeacher(courses, keyword);
        break;
      case 'courseCode':
        results = searchCoursesByCode(courses, keyword);
        break;
      case 'serialNumber':
        results = searchCoursesBySerialNumber(courses, keyword);
        break;
      case 'courseId':
        results = searchCoursesById(courses, keyword);
        break;
      default:
        results = [];
    }
    
    console.log('搜尋後結果:', results.length, '筆');
    
    // 應用過濾器
    results = applyFilters(results, filters);
    
    console.log('最終搜尋結果:', results.length, '筆');
    return results;
  }, [applyFilters]);

  return {
    performSearch
  };
}
