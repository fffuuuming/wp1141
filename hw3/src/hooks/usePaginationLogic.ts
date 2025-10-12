import { useCallback } from 'react';
import { usePagination } from '../contexts/PaginationContext';
import { useAppState } from '../contexts/AppStateContext';

// 分頁 Hook
export function usePaginationLogic() {
  const paginationContext = usePagination();
  const { appState } = useAppState();

  // 計算當前頁的數據
  const getCurrentPageData = useCallback(() => {
    const startIndex = (paginationContext.paginationInfo.currentPage - 1) * paginationContext.paginationInfo.itemsPerPage;
    const endIndex = startIndex + paginationContext.paginationInfo.itemsPerPage;
    return appState.searchResults.slice(startIndex, endIndex);
  }, [appState.searchResults, paginationContext.paginationInfo.currentPage, paginationContext.paginationInfo.itemsPerPage]);

  // 改變每頁顯示數量
  const changePageSize = useCallback((size: number) => {
    paginationContext.changePageSize(size, appState.searchResults.length);
  }, [paginationContext, appState.searchResults.length]);

  return {
    ...paginationContext,
    getCurrentPageData,
    changePageSize
  };
}
