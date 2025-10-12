import { useCallback } from 'react';
import { useSearchState } from '../contexts/SearchStateContext';
import { useAppState } from '../contexts/AppStateContext';
import { usePagination } from '../contexts/PaginationContext';
import type { CourseType } from '../types';

// 系所搜尋 Hook
export function useDepartmentSearch() {
  const { 
    departmentSearchState, 
    setDepartmentSearchState
  } = useSearchState();

  const { 
    updateSearchResults,
    appState 
  } = useAppState();

  const { changePageSize } = usePagination();

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
    
    // 如果變更的是每頁顯示筆數，立即更新分頁信息
    if (filterType === 'pageSize') {
      const pageSize = typeof value === 'number' ? value : parseInt(value as string) || 15;
      changePageSize(pageSize, appState.searchResults.length);
    }
  }, [setDepartmentSearchState, changePageSize, appState.searchResults.length]);

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
    
    // 更新分頁信息，使用當前設定的每頁顯示筆數
    const pageSize = departmentSearchState.filters.pageSize || 15;
    changePageSize(pageSize, results.length);
  }, [departmentSearchState, appState.courses, updateSearchResults, changePageSize]);

  return {
    searchState: departmentSearchState,
    handleCollegeChange,
    handleDepartmentChange,
    handleRequirementTypeChange,
    handleFilterChange,
    performSearch
  };
}
