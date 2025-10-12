import { useCallback, useEffect } from 'react';
import { useSearchState } from '../contexts/SearchStateContext';
import { useAppState } from '../contexts/AppStateContext';
import { usePagination } from '../contexts/PaginationContext';
import type { SearchMethod } from '../types';
import { useSearchLogic } from './useSearchLogic';

// 快速搜尋 Hook
export function useQuickSearch() {
  const { 
    quickSearchState, 
    setQuickSearchState
  } = useSearchState();

  const { 
    updateSearchResults,
    appState 
  } = useAppState();

  const { changePageSize } = usePagination();
  const { performSearch } = useSearchLogic();

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
    
    // 如果變更的是每頁顯示筆數，立即更新分頁信息
    if (filterType === 'pageSize') {
      const pageSize = typeof value === 'number' ? value : parseInt(value as string) || 15;
      changePageSize(pageSize, appState.searchResults.length);
    }
  }, [setQuickSearchState, changePageSize, appState.searchResults.length]);

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

  const executeSearch = useCallback(() => {
    const results = performSearch(
      appState.courses,
      quickSearchState.searchMethod,
      quickSearchState.keyword,
      quickSearchState.filters
    );
    updateSearchResults(results);
    
    // 更新分頁信息，使用當前設定的每頁顯示筆數
    const pageSize = quickSearchState.filters.pageSize || 15;
    changePageSize(pageSize, results.length);
  }, [performSearch, appState.courses, quickSearchState, updateSearchResults, changePageSize]);

  // 自動觸發搜尋當過濾器變化時
  useEffect(() => {
    // 只有在有搜尋關鍵字時才自動觸發搜尋
    if (quickSearchState.keyword.trim()) {
      executeSearch();
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
    performSearch: executeSearch
  };
}
