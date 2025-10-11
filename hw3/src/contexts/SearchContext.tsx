import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CourseData } from '../utils/csvParser';

// Context 介面
interface SearchContextType {
  searchResults: CourseData[];
  setSearchResults: (results: CourseData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// 創建 Context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider 組件
export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SearchContext.Provider value={{
      searchResults,
      setSearchResults,
      isLoading,
      setIsLoading
    }}>
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
