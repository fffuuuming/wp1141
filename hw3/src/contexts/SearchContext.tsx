import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { 
  CourseData, 
  AppState, 
  QuickSearchState, 
  DepartmentSearchState,
  PaginationInfo 
} from '../types';
import { parseCSV } from '../utils/csvParser';

// Context 介面
interface SearchContextType {
  // 應用程式狀態
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  
  // 搜尋狀態
  quickSearchState: QuickSearchState;
  setQuickSearchState: React.Dispatch<React.SetStateAction<QuickSearchState>>;
  departmentSearchState: DepartmentSearchState;
  setDepartmentSearchState: React.Dispatch<React.SetStateAction<DepartmentSearchState>>;
  
  // 分頁資訊
  paginationInfo: PaginationInfo;
  setPaginationInfo: React.Dispatch<React.SetStateAction<PaginationInfo>>;
  
  // 操作方法
  updateSearchResults: (results: CourseData[]) => void;
  updateLoadingState: (loading: boolean) => void;
  loadCourseData: () => Promise<void>;
  resetSearch: () => void;
}

// 創建 Context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider 組件
export function SearchProvider({ children }: { children: ReactNode }) {
  // 應用程式狀態
  const [appState, setAppState] = useState<AppState>({
    searchResults: [],
    isLoading: false,
    currentPage: 1,
    courses: []
  });

  // 快速搜尋狀態
  const [quickSearchState, setQuickSearchState] = useState<QuickSearchState>({
    searchMethod: 'courseName',
    keyword: '',
    filters: {
      timeFilter: 'unlimited',
      periodFilter: 'unlimited',
      addMethodFilter: 'unlimited',
      pageSize: 15
    }
  });

  // 系所搜尋狀態
  const [departmentSearchState, setDepartmentSearchState] = useState<DepartmentSearchState>({
    college: '',
    department: '',
    requirementType: 'all',
    filters: {
      timeFilter: 'unlimited',
      periodFilter: 'unlimited',
      addMethodFilter: 'unlimited',
      pageSize: 15
    }
  });

  // 分頁資訊
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15
  });

  // 更新搜尋結果
  const updateSearchResults = useCallback((results: CourseData[]) => {
    setAppState(prev => ({ ...prev, searchResults: results }));
    
    // 更新分頁資訊
    const totalPages = Math.ceil(results.length / paginationInfo.itemsPerPage);
    setPaginationInfo(prev => ({
      ...prev,
      totalPages,
      totalItems: results.length,
      currentPage: 1
    }));
  }, [paginationInfo.itemsPerPage]);

  // 更新載入狀態
  const updateLoadingState = useCallback((loading: boolean) => {
    setAppState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  // 載入課程數據
  const loadCourseData = useCallback(async () => {
    try {
      updateLoadingState(true);
      const response = await fetch('/hw3-ntucourse-data-1002.csv');
      const csvText = await response.text();
      
      const parsedCourses = parseCSV(csvText);
      
      setAppState(prev => ({ ...prev, courses: parsedCourses }));
      updateLoadingState(false);
    } catch (error) {
      console.error('載入課程數據失敗:', error);
      updateLoadingState(false);
    }
  }, [updateLoadingState]);

  // 重置搜尋
  const resetSearch = useCallback(() => {
    setAppState(prev => ({ ...prev, searchResults: [], currentPage: 1 }));
    setPaginationInfo(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalItems: 0 }));
  }, []);

  const value: SearchContextType = {
    appState,
    setAppState,
    quickSearchState,
    setQuickSearchState,
    departmentSearchState,
    setDepartmentSearchState,
    paginationInfo,
    setPaginationInfo,
    updateSearchResults,
    updateLoadingState,
    loadCourseData,
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
