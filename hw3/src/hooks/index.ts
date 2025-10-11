import { useState, useEffect, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import type { CourseData, SearchMethod, CourseType } from '../types';
import {
  searchCoursesByName,
  searchCoursesByTeacher,
  searchCoursesByCode,
  searchCoursesBySerialNumber,
  searchCoursesById
} from '../utils/csvParser';

// 根據上課時間過濾課程
function filterCoursesByTime(courses: CourseData[], selectedWeekdays: string[]): CourseData[] {
  if (selectedWeekdays.length === 0) {
    return courses;
  }
  
  return courses.filter(course => {
    // 檢查課程是否有在選中的星期上課
    // 只要課程在任一選中的星期有上課，就保留
    for (let i = 1; i <= 6; i++) {
      const dayKey = `day${i}` as keyof CourseData;
      const dayValue = course[dayKey] as string;
      
      if (dayValue && dayValue.trim() !== '') {
        const weekday = WEEKDAYS[i.toString() as keyof typeof WEEKDAYS];

        if (weekday && selectedWeekdays.includes(weekday)) {
          return true;
        }
      }
    }
    return false;
  });
}

// 根據節次過濾課程
function filterCoursesByPeriod(courses: CourseData[], selectedPeriods: string[]): CourseData[] {
  if (selectedPeriods.length === 0) {
    return courses;
  }
  
  return courses.filter(course => {
    // 檢查課程是否有在選中的節次上課
    // 只要課程在任一選中的節次有上課，就保留
    for (let i = 1; i <= 6; i++) {
      const dayKey = `day${i}` as keyof CourseData;
      const dayValue = course[dayKey] as string;
      
      if (dayValue && dayValue.trim() !== '') {
        // 將節次字符串轉換為字符數組，每個字符代表一個節次
        const periods = dayValue.split('').filter(period => period.trim() !== '');
        
        // 檢查是否有任何節次匹配
        for (const period of periods) {
          if (selectedPeriods.includes(period)) {
            return true;
          }
        }
      }
    }
    return false;
  });
}

// 根據加選方式過濾課程
function filterCoursesByAddMethod(courses: CourseData[], selectedAddMethods: string[]): CourseData[] {
  if (selectedAddMethods.length === 0) {
    return courses;
  }
  
  return courses.filter(course => {
    // 檢查課程的加選方式是否在選中的選項中
    const coSelect = course.co_select;
    
    if (coSelect && coSelect.trim() !== '') {
      // 將選中的加選方式類別轉換為對應的數字
      const addMethodNumbers = selectedAddMethods.map(method => {
        switch (method) {
          case '第1類': return '1';
          case '第2類': return '2';
          case '第3類': return '3';
          default: return method;
        }
      });
      
      return addMethodNumbers.includes(coSelect);
    }
    
    return false;
  });
}

// 星期對應的中文
const WEEKDAYS = {
  '1': '週一',
  '2': '週二',
  '3': '週三',
  '4': '週四',
  '5': '週五',
  '6': '週六'
};

// 課程數據載入 Hook
export function useCourseData() {
  const { appState, loadCourseData } = useSearch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && appState.courses.length === 0) {
      console.log('開始載入課程數據...');
      loadCourseData();
      setIsInitialized(true);
    }
  }, [isInitialized, appState.courses.length, loadCourseData]);

  useEffect(() => {
    if (appState.courses.length > 0) {
      console.log('課程數據載入完成，共', appState.courses.length, '筆課程');
    }
  }, [appState.courses.length]);

  return {
    courses: appState.courses,
    isLoading: appState.isLoading,
    isInitialized
  };
}

// 快速搜尋 Hook
export function useQuickSearch() {
  const { 
    quickSearchState, 
    setQuickSearchState, 
    updateSearchResults,
    appState 
  } = useSearch();

  const handleSearchMethodChange = useCallback((method: SearchMethod) => {
    setQuickSearchState(prev => ({ ...prev, searchMethod: method }));
  }, [setQuickSearchState]);

  const handleKeywordChange = useCallback((keyword: string) => {
    setQuickSearchState(prev => ({ ...prev, keyword }));
  }, [setQuickSearchState]);

  const handleFilterChange = useCallback((filterType: string, value: string | number) => {
    setQuickSearchState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  }, [setQuickSearchState]);

  const handleOptionChange = useCallback((optionType: string, option: string, checked: boolean) => {
    setQuickSearchState(prev => {
      const currentOptions = prev.filters[optionType as keyof typeof prev.filters] as string[];
      const newOptions = checked 
        ? [...currentOptions, option]
        : currentOptions.filter(opt => opt !== option);
      
      return {
        ...prev,
        filters: {
          ...prev.filters,
          [optionType]: newOptions
        }
      };
    });
  }, [setQuickSearchState]);

  const performSearch = useCallback(() => {
    console.log('執行搜尋:', quickSearchState);
    console.log('可用課程數量:', appState.courses.length);
    
    if (!quickSearchState.keyword.trim()) {
      console.log('關鍵字為空，清空結果');
      updateSearchResults([]);
      return;
    }

    let results: CourseData[] = [];
    
    switch (quickSearchState.searchMethod) {
      case 'courseName':
        console.log('使用課程名稱搜尋:', quickSearchState.keyword);
        results = searchCoursesByName(appState.courses, quickSearchState.keyword);
        console.log('課程名稱搜尋結果:', results.length, '筆');
        break;
      case 'teacherName':
        results = searchCoursesByTeacher(appState.courses, quickSearchState.keyword);
        break;
      case 'courseCode':
        results = searchCoursesByCode(appState.courses, quickSearchState.keyword);
        break;
      case 'serialNumber':
        results = searchCoursesBySerialNumber(appState.courses, quickSearchState.keyword);
        break;
      case 'courseId':
        results = searchCoursesById(appState.courses, quickSearchState.keyword);
        break;
      default:
        results = [];
    }
    
    console.log('搜尋後結果:', results.length, '筆');
    
    // 應用時間過濾器
    if (quickSearchState.filters.timeFilter === 'limited') {
      console.log('應用時間過濾器，選中的星期:', quickSearchState.filters.selectedWeekdays);
      results = filterCoursesByTime(results, quickSearchState.filters.selectedWeekdays);
      console.log('時間過濾後結果:', results.length, '筆');
    }
    
    // 應用節次過濾器
    if (quickSearchState.filters.periodFilter === 'limited') {
      console.log('應用節次過濾器，選中的節次:', quickSearchState.filters.selectedPeriods);
      results = filterCoursesByPeriod(results, quickSearchState.filters.selectedPeriods);
      console.log('節次過濾後結果:', results.length, '筆');
    }
    
    // 應用加選方式過濾器
    if (quickSearchState.filters.addMethodFilter === 'limited') {
      console.log('應用加選方式過濾器，選中的加選方式:', quickSearchState.filters.selectedAddMethods);
      results = filterCoursesByAddMethod(results, quickSearchState.filters.selectedAddMethods);
      console.log('加選方式過濾後結果:', results.length, '筆');
    }
    
    console.log('最終搜尋結果:', results.length, '筆');
    updateSearchResults(results);
  }, [quickSearchState, appState.courses, updateSearchResults]);

  // 自動觸發搜尋當過濾器變化時
  useEffect(() => {
    // 只有在有搜尋關鍵字時才自動觸發搜尋
    if (quickSearchState.keyword.trim()) {
      performSearch();
    }
  }, [
    quickSearchState.filters.timeFilter,
    quickSearchState.filters.periodFilter,
    quickSearchState.filters.addMethodFilter,
    quickSearchState.filters.selectedWeekdays,
    quickSearchState.filters.selectedPeriods,
    quickSearchState.filters.selectedAddMethods
  ]);

  return {
    searchState: quickSearchState,
    handleSearchMethodChange,
    handleKeywordChange,
    handleFilterChange,
    handleOptionChange,
    performSearch
  };
}

// 系所搜尋 Hook
export function useDepartmentSearch() {
  const { 
    departmentSearchState, 
    setDepartmentSearchState, 
    updateSearchResults,
    appState 
  } = useSearch();

  const handleCollegeChange = useCallback((college: string) => {
    setDepartmentSearchState(prev => ({ ...prev, college }));
  }, [setDepartmentSearchState]);

  const handleDepartmentChange = useCallback((department: string) => {
    setDepartmentSearchState(prev => ({ ...prev, department }));
  }, [setDepartmentSearchState]);

  const handleRequirementTypeChange = useCallback((requirementType: CourseType) => {
    setDepartmentSearchState(prev => ({ ...prev, requirementType }));
  }, [setDepartmentSearchState]);

  const handleFilterChange = useCallback((filterType: string, value: string | number) => {
    setDepartmentSearchState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  }, [setDepartmentSearchState]);

  const performSearch = useCallback(() => {
    // 實現系所搜尋邏輯
    let results = appState.courses;
    
    // 根據學院篩選
    if (departmentSearchState.college) {
      results = results.filter(course => 
        course.dpt_code && course.dpt_code.startsWith(departmentSearchState.college)
      );
    }
    
    // 根據系所篩選
    if (departmentSearchState.department) {
      results = results.filter(course => 
        course.dpt_code === departmentSearchState.department
      );
    }
    
    // 根據課程類型篩選
    if (departmentSearchState.requirementType !== 'all') {
      // 這裡需要根據實際的課程類型欄位來篩選
      // 暫時跳過這個篩選
    }
    
    updateSearchResults(results);
  }, [departmentSearchState, appState.courses, updateSearchResults]);

  return {
    searchState: departmentSearchState,
    handleCollegeChange,
    handleDepartmentChange,
    handleRequirementTypeChange,
    handleFilterChange,
    performSearch
  };
}

// 分頁 Hook
export function usePagination() {
  const { paginationInfo, setPaginationInfo, appState } = useSearch();

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setPaginationInfo(prev => ({ ...prev, currentPage: page }));
    }
  }, [paginationInfo.totalPages, setPaginationInfo]);

  const goToNextPage = useCallback(() => {
    goToPage(paginationInfo.currentPage + 1);
  }, [paginationInfo.currentPage, goToPage]);

  const goToPrevPage = useCallback(() => {
    goToPage(paginationInfo.currentPage - 1);
  }, [paginationInfo.currentPage, goToPage]);

  const changePageSize = useCallback((size: number) => {
    setPaginationInfo(prev => ({
      ...prev,
      itemsPerPage: size,
      currentPage: 1,
      totalPages: Math.ceil(appState.searchResults.length / size)
    }));
  }, [appState.searchResults.length, setPaginationInfo]);

  // 計算當前頁的數據
  const getCurrentPageData = useCallback(() => {
    const startIndex = (paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage;
    const endIndex = startIndex + paginationInfo.itemsPerPage;
    return appState.searchResults.slice(startIndex, endIndex);
  }, [appState.searchResults, paginationInfo.currentPage, paginationInfo.itemsPerPage]);

  return {
    paginationInfo,
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,
    getCurrentPageData
  };
}

// 搜尋結果 Hook
export function useSearchResults() {
  const { appState, updateSearchResults, resetSearch } = useSearch();

  const clearResults = useCallback(() => {
    resetSearch();
  }, [resetSearch]);

  return {
    searchResults: appState.searchResults,
    isLoading: appState.isLoading,
    updateSearchResults,
    clearResults
  };
}
