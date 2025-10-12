import { useMemo } from 'react';
import type { CourseData } from '../types';

// UI 工具類
export class UIUtils {
  // 生成唯一的 key
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}_${parts.join('_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 格式化數字
  static formatNumber(num: number, decimals: number = 0): string {
    return num.toLocaleString('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // 格式化日期
  static formatDate(date: Date, format: 'short' | 'long' | 'time' = 'short'): string {
    let options: Intl.DateTimeFormatOptions;
    
    switch (format) {
      case 'short':
        options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        break;
      case 'long':
        options = { year: 'numeric', month: 'long', day: 'numeric' };
        break;
      case 'time':
        options = { hour: '2-digit', minute: '2-digit' };
        break;
      default:
        options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    }

    return date.toLocaleDateString('zh-TW', options);
  }

  // 截斷文字
  static truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  // 高亮搜尋關鍵字
  static highlightText(text: string, keyword: string): string {
    if (!keyword.trim()) {
      return text;
    }
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // 計算分頁信息
  static calculatePagination(
    totalItems: number, 
    currentPage: number, 
    itemsPerPage: number
  ): {
    totalPages: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }

  // 生成分頁按鈕
  static generatePaginationButtons(
    currentPage: number, 
    totalPages: number, 
    maxVisible: number = 7
  ): (number | 'ellipsis')[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const buttons: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (currentPage <= halfVisible) {
      // 開頭
      for (let i = 1; i <= maxVisible - 2; i++) {
        buttons.push(i);
      }
      buttons.push('ellipsis');
      buttons.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
      // 結尾
      buttons.push(1);
      buttons.push('ellipsis');
      for (let i = totalPages - maxVisible + 3; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // 中間
      buttons.push(1);
      buttons.push('ellipsis');
      for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
        buttons.push(i);
      }
      buttons.push('ellipsis');
      buttons.push(totalPages);
    }

    return buttons;
  }

  // 防抖函數
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | undefined;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 節流函數
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// React Hook 版本的工具
export function usePaginationUtils(totalItems: number, currentPage: number, itemsPerPage: number) {
  return useMemo(() => 
    UIUtils.calculatePagination(totalItems, currentPage, itemsPerPage),
    [totalItems, currentPage, itemsPerPage]
  );
}

export function usePaginationButtons(currentPage: number, totalPages: number, maxVisible: number = 7) {
  return useMemo(() => 
    UIUtils.generatePaginationButtons(currentPage, totalPages, maxVisible),
    [currentPage, totalPages, maxVisible]
  );
}

export function useCourseKey(course: CourseData, index: number): string {
  return useMemo(() => 
    UIUtils.generateKey('course', course.ser_no, index),
    [course.ser_no, index]
  );
}

// 導出便捷函數
export const generateKey = UIUtils.generateKey;
export const formatNumber = UIUtils.formatNumber;
export const formatDate = UIUtils.formatDate;
export const truncateText = UIUtils.truncateText;
export const highlightText = UIUtils.highlightText;
export const calculatePagination = UIUtils.calculatePagination;
export const generatePaginationButtons = UIUtils.generatePaginationButtons;
export const debounce = UIUtils.debounce;
export const throttle = UIUtils.throttle;
