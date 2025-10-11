import { useCallback } from 'react';
import type { CourseData } from '../types';

// 星期對應的中文
const WEEKDAYS = {
  '1': '週一',
  '2': '週二',
  '3': '週三',
  '4': '週四',
  '5': '週五',
  '6': '週六'
};

// 根據上課時間過濾課程
export function filterCoursesByTime(courses: CourseData[], selectedWeekdays: string[]): CourseData[] {
  if (selectedWeekdays.length === 0) {
    return courses;
  }
  
  return courses.filter(course => {
    // 檢查課程是否有在選中的星期上課
    // 只要課程在任一選中的星期有上課，就保留
    for (let i = 1; i <= 6; i++) {
      const dayKey = `day${i}` as keyof CourseData;
      const dayValue = course[dayKey] as string;
      
      if (dayValue && dayValue.trim() !== '') {
        const weekday = WEEKDAYS[i.toString() as keyof typeof WEEKDAYS];
        if (weekday && selectedWeekdays.includes(weekday)) {
          return true;
        }
      }
    }
    return false;
  });
}

// 根據節次過濾課程
export function filterCoursesByPeriod(courses: CourseData[], selectedPeriods: string[]): CourseData[] {
  if (selectedPeriods.length === 0) {
    return courses;
  }
  
  return courses.filter(course => {
    // 檢查課程是否有在選中的節次上課
    // 只要課程在任一選中的節次有上課，就保留
    for (let i = 1; i <= 6; i++) {
      const dayKey = `day${i}` as keyof CourseData;
      const dayValue = course[dayKey] as string;
      
      if (dayValue && dayValue.trim() !== '') {
        // 將節次字符串轉換為字符數組，每個字符代表一個節次
        const periods = dayValue.split('').filter(period => period.trim() !== '');
        
        // 檢查是否有任何節次匹配
        for (const period of periods) {
          if (selectedPeriods.includes(period)) {
            return true;
          }
        }
      }
    }
    return false;
  });
}

// 根據加選方式過濾課程
export function filterCoursesByAddMethod(courses: CourseData[], selectedAddMethods: string[]): CourseData[] {
  if (selectedAddMethods.length === 0) {
    return courses;
  }
  
  return courses.filter(course => {
    // 檢查課程的加選方式是否在選中的選項中
    const coSelect = course.co_select;
    
    if (coSelect && coSelect.trim() !== '') {
      // 將選中的加選方式類別轉換為對應的數字
      const addMethodNumbers = selectedAddMethods.map(method => {
        switch (method) {
          case '第1類': return '1';
          case '第2類': return '2';
          case '第3類': return '3';
          default: return method;
        }
      });
      
      return addMethodNumbers.includes(coSelect);
    }
    
    return false;
  });
}

// 共用的過濾邏輯 Hook
export function useCourseFilters() {
  const applyFilters = useCallback((
    courses: CourseData[],
    filters: {
      timeFilter: string;
      periodFilter: string;
      addMethodFilter: string;
      selectedWeekdays: string[];
      selectedPeriods: string[];
      selectedAddMethods: string[];
    }
  ): CourseData[] => {
    let results = [...courses];
    
    // 應用時間過濾器
    if (filters.timeFilter === 'limited') {
      results = filterCoursesByTime(results, filters.selectedWeekdays);
    }
    
    // 應用節次過濾器
    if (filters.periodFilter === 'limited') {
      results = filterCoursesByPeriod(results, filters.selectedPeriods);
    }
    
    // 應用加選方式過濾器
    if (filters.addMethodFilter === 'limited') {
      results = filterCoursesByAddMethod(results, filters.selectedAddMethods);
    }
    
    return results;
  }, []);

  return {
    applyFilters,
    filterCoursesByTime,
    filterCoursesByPeriod,
    filterCoursesByAddMethod
  };
}
