import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CourseData, AppState } from '../types';
import { parseCSV } from '../utils/csvParser';

// Context 介面
interface AppStateContextType {
  // 應用程式狀態
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  
  // 操作方法
  updateSearchResults: (results: CourseData[]) => void;
  updateLoadingState: (loading: boolean) => void;
  loadCourseData: () => Promise<void>;
  resetSearch: () => void;
}

// 創建 Context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Provider 組件
export function AppStateProvider({ children }: { children: ReactNode }) {
  // 應用程式狀態
  const [appState, setAppState] = useState<AppState>({
    searchResults: [],
    isLoading: false,
    currentPage: 1,
    courses: []
  });

  // 更新搜尋結果
  const updateSearchResults = useCallback((results: CourseData[]) => {
    setAppState(prev => ({ ...prev, searchResults: results }));
  }, []);

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
  }, []);

  const value: AppStateContextType = {
    appState,
    setAppState,
    updateSearchResults,
    updateLoadingState,
    loadCourseData,
    resetSearch
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook 來使用 Context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
