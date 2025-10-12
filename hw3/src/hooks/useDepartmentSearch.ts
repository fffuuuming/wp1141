import { useCallback, useEffect } from 'react';
import { useSearchState } from '../contexts/SearchStateContext';
import { useAppState } from '../contexts/AppStateContext';
import { usePagination } from '../contexts/PaginationContext';
import { useCourseFilters } from './useCourseFilters';
import { formatCourseType } from '../utils/courseTypeFormatter';
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
  const { applyFilters } = useCourseFilters();

  const handleCollegeChange = useCallback((college: string) => {
    setDepartmentSearchState(prev => ({ 
      ...prev, 
      college,
      // 當選擇學院時，自動設置對應的系所
      department: college
    }));
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

  const handleOptionChange = useCallback((optionType: string, option: string, checked: boolean) => {
    setDepartmentSearchState(prev => {
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
  }, [setDepartmentSearchState]);

  const performSearch = useCallback(() => {
    // 實現系所搜尋邏輯
    let results = appState.courses;
    
    // 只根據系所篩選（學院選擇只是為了方便用戶切換到系所選項）
    if (departmentSearchState.department) {
      results = results.filter(course => 
        course.dpt_code === departmentSearchState.department
      );
    }
    
    // 根據課程類型篩選
    if (departmentSearchState.requirementType !== 'all') {
      results = results.filter(course => {
        const courseType = formatCourseType(course.sel_code);
        if (departmentSearchState.requirementType === 'required') {
          return courseType === '必修';
        } else if (departmentSearchState.requirementType === 'elective') {
          return courseType === '選修';
        }
        return true;
      });
    }
    
    // 應用過濾器（時間、節次、加選方式）
    results = applyFilters(results, departmentSearchState.filters);
    
    updateSearchResults(results);
    
    // 更新分頁信息，使用當前設定的每頁顯示筆數
    const pageSize = departmentSearchState.filters.pageSize || 15;
    changePageSize(pageSize, results.length);
  }, [departmentSearchState, appState.courses, updateSearchResults, changePageSize, applyFilters]);

  // 自動觸發搜尋當過濾器變化時
  useEffect(() => {
    // 只有在有選擇系所時才自動觸發搜尋（學院選擇只是為了方便切換）
    if (departmentSearchState.department) {
      performSearch();
    }
  }, [
    departmentSearchState.department,
    departmentSearchState.requirementType,
    departmentSearchState.filters.timeFilter,
    departmentSearchState.filters.periodFilter,
    departmentSearchState.filters.addMethodFilter,
    departmentSearchState.filters.selectedWeekdays,
    departmentSearchState.filters.selectedPeriods,
    departmentSearchState.filters.selectedAddMethods
  ]);

  return {
    searchState: departmentSearchState,
    handleCollegeChange,
    handleDepartmentChange,
    handleRequirementTypeChange,
    handleFilterChange,
    handleOptionChange,
    performSearch
  };
}
