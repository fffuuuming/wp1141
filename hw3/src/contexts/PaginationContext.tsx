import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PaginationInfo } from '../types';

// Context 介面
interface PaginationContextType {
  // 分頁資訊
  paginationInfo: PaginationInfo;
  setPaginationInfo: React.Dispatch<React.SetStateAction<PaginationInfo>>;
  
  // 操作方法
  updatePagination: (totalItems: number, itemsPerPage: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  changePageSize: (size: number, totalItems: number) => void;
}

// 創建 Context
const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

// Provider 組件
export function PaginationProvider({ children }: { children: ReactNode }) {
  // 分頁資訊
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15
  });

  // 更新分頁資訊
  const updatePagination = useCallback((totalItems: number, itemsPerPage: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    setPaginationInfo(prev => ({
      ...prev,
      totalPages,
      totalItems,
      itemsPerPage,
      currentPage: 1
    }));
  }, []);

  // 跳轉到指定頁面
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setPaginationInfo(prev => ({ ...prev, currentPage: page }));
    }
  }, [paginationInfo.totalPages]);

  // 下一頁
  const goToNextPage = useCallback(() => {
    goToPage(paginationInfo.currentPage + 1);
  }, [paginationInfo.currentPage, goToPage]);

  // 上一頁
  const goToPrevPage = useCallback(() => {
    goToPage(paginationInfo.currentPage - 1);
  }, [paginationInfo.currentPage, goToPage]);

  // 改變每頁顯示數量
  const changePageSize = useCallback((size: number, totalItems: number) => {
    const totalPages = Math.ceil(totalItems / size);
    setPaginationInfo(prev => ({
      ...prev,
      itemsPerPage: size,
      currentPage: 1,
      totalPages
    }));
  }, []);

  const value: PaginationContextType = {
    paginationInfo,
    setPaginationInfo,
    updatePagination,
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize
  };

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
}

// Hook 來使用 Context
export function usePagination() {
  const context = useContext(PaginationContext);
  if (context === undefined) {
    throw new Error('usePagination must be used within a PaginationProvider');
  }
  return context;
}
