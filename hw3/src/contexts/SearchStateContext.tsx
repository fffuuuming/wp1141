import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { 
  QuickSearchState, 
  DepartmentSearchState 
} from '../types';

// Context 介面
interface SearchStateContextType {
  // 搜尋狀態
  quickSearchState: QuickSearchState;
  setQuickSearchState: React.Dispatch<React.SetStateAction<QuickSearchState>>;
  departmentSearchState: DepartmentSearchState;
  setDepartmentSearchState: React.Dispatch<React.SetStateAction<DepartmentSearchState>>;
  
  // 操作方法
  resetQuickSearch: () => void;
  resetDepartmentSearch: () => void;
}

// 創建 Context
const SearchStateContext = createContext<SearchStateContextType | undefined>(undefined);

// Provider 組件
export function SearchStateProvider({ children }: { children: ReactNode }) {
  // 快速搜尋狀態
  const [quickSearchState, setQuickSearchState] = useState<QuickSearchState>({
    searchMethod: 'courseName',
    keyword: '',
    filters: {
      timeFilter: 'unlimited',
      periodFilter: 'unlimited',
      addMethodFilter: 'unlimited',
      pageSize: 15,
      selectedWeekdays: [],
      selectedPeriods: [],
      selectedAddMethods: []
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
      pageSize: 15,
      selectedWeekdays: [],
      selectedPeriods: [],
      selectedAddMethods: []
    }
  });

  // 重置快速搜尋
  const resetQuickSearch = useCallback(() => {
    setQuickSearchState({
      searchMethod: 'courseName',
      keyword: '',
      filters: {
        timeFilter: 'unlimited',
        periodFilter: 'unlimited',
        addMethodFilter: 'unlimited',
        pageSize: 15,
        selectedWeekdays: [],
        selectedPeriods: [],
        selectedAddMethods: []
      }
    });
  }, []);

  // 重置系所搜尋
  const resetDepartmentSearch = useCallback(() => {
    setDepartmentSearchState({
      college: '',
      department: '',
      requirementType: 'all',
      filters: {
        timeFilter: 'unlimited',
        periodFilter: 'unlimited',
        addMethodFilter: 'unlimited',
        pageSize: 15,
        selectedWeekdays: [],
        selectedPeriods: [],
        selectedAddMethods: []
      }
    });
  }, []);

  const value: SearchStateContextType = {
    quickSearchState,
    setQuickSearchState,
    departmentSearchState,
    setDepartmentSearchState,
    resetQuickSearch,
    resetDepartmentSearch
  };

  return (
    <SearchStateContext.Provider value={value}>
      {children}
    </SearchStateContext.Provider>
  );
}

// Hook 來使用 Context
export function useSearchState() {
  const context = useContext(SearchStateContext);
  if (context === undefined) {
    throw new Error('useSearchState must be used within a SearchStateProvider');
  }
  return context;
}
