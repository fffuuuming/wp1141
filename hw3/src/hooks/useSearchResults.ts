import { useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';

// 搜尋結果 Hook
export function useSearchResults() {
  const { appState, updateSearchResults, resetSearch } = useAppState();

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
