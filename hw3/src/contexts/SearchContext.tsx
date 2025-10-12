import { createContext, useContext, type ReactNode } from 'react';
import { AppStateProvider, useAppState } from './AppStateContext';
import { SearchStateProvider, useSearchState } from './SearchStateContext';
import { PaginationProvider, usePagination } from './PaginationContext';
import type { CourseData } from '../types';

// Context 介面 - 現在作為組合多個 Context 的統一介面
interface SearchContextType {
  // 應用程式狀態
  appState: ReturnType<typeof useAppState>['appState'];
  setAppState: ReturnType<typeof useAppState>['setAppState'];
  
  // 搜尋狀態
  quickSearchState: ReturnType<typeof useSearchState>['quickSearchState'];
  setQuickSearchState: ReturnType<typeof useSearchState>['setQuickSearchState'];
  departmentSearchState: ReturnType<typeof useSearchState>['departmentSearchState'];
  setDepartmentSearchState: ReturnType<typeof useSearchState>['setDepartmentSearchState'];
  
  // 分頁資訊
  paginationInfo: ReturnType<typeof usePagination>['paginationInfo'];
  setPaginationInfo: ReturnType<typeof usePagination>['setPaginationInfo'];
  
  // 操作方法
  updateSearchResults: (results: CourseData[]) => void;
  updateLoadingState: (loading: boolean) => void;
  loadCourseData: () => Promise<void>;
  resetSearch: () => void;
}

// 創建 Context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider 組件 - 組合多個 Provider
export function SearchProvider({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <SearchStateProvider>
        <PaginationProvider>
          <SearchContextProvider>{children}</SearchContextProvider>
        </PaginationProvider>
      </SearchStateProvider>
    </AppStateProvider>
  );
}

// 內部 Provider 組件，用於組合所有 Context 的值
function SearchContextProvider({ children }: { children: ReactNode }) {
  const appStateContext = useAppState();
  const searchStateContext = useSearchState();
  const paginationContext = usePagination();

  // 更新搜尋結果 - 同時更新應用程式狀態和分頁資訊
  const updateSearchResults = (results: CourseData[]) => {
    appStateContext.updateSearchResults(results);
    paginationContext.updatePagination(results.length, paginationContext.paginationInfo.itemsPerPage);
  };

  // 重置搜尋 - 同時重置應用程式狀態和分頁資訊
  const resetSearch = () => {
    appStateContext.resetSearch();
    paginationContext.updatePagination(0, paginationContext.paginationInfo.itemsPerPage);
  };

  const value: SearchContextType = {
    // 應用程式狀態
    appState: appStateContext.appState,
    setAppState: appStateContext.setAppState,
    
    // 搜尋狀態
    quickSearchState: searchStateContext.quickSearchState,
    setQuickSearchState: searchStateContext.setQuickSearchState,
    departmentSearchState: searchStateContext.departmentSearchState,
    setDepartmentSearchState: searchStateContext.setDepartmentSearchState,
    
    // 分頁資訊
    paginationInfo: paginationContext.paginationInfo,
    setPaginationInfo: paginationContext.setPaginationInfo,
    
    // 操作方法
    updateSearchResults,
    updateLoadingState: appStateContext.updateLoadingState,
    loadCourseData: appStateContext.loadCourseData,
    resetSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

// Hook 來使用 Context
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
