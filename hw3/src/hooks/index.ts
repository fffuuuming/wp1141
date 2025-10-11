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
        results = searchCoursesByName(appState.courses, quickSearchState.keyword);
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
    
    console.log('搜尋結果:', results.length, '筆');
    updateSearchResults(results);
  }, [quickSearchState, appState.courses, updateSearchResults]);

  return {
    searchState: quickSearchState,
    handleSearchMethodChange,
    handleKeywordChange,
    handleFilterChange,
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
