import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CourseData, PlannedCourse } from '../types';

// Context 介面
interface PlannedCoursesContextType {
  plannedCourses: PlannedCourse[];
  addCourseToPlanned: (course: CourseData) => void;
  removeCourseFromPlanned: (courseId: string) => void;
  removeAllCoursesFromPlanned: () => void;
  isCourseInPlanned: (courseId: string) => boolean;
}

// 創建 Context
const PlannedCoursesContext = createContext<PlannedCoursesContextType | undefined>(undefined);

// Provider 組件
export function PlannedCoursesProvider({ children }: { children: ReactNode }) {
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);

  // 添加課程到預計要選的列表
  const addCourseToPlanned = useCallback((course: CourseData) => {
    setPlannedCourses(prev => {
      // 檢查是否已經存在（使用流水號比對）
      const exists = prev.some(pc => pc.ser_no === course.ser_no);
      if (exists) {
        console.log('課程已經在預計要選的列表中:', course.cou_cname);
        return prev;
      }

      // 創建新的預計要選的課程
      const newPlannedCourse: PlannedCourse = {
        ...course,
        addedAt: new Date(),
        serialNumber: prev.length + 1
      };

      console.log('成功添加課程到預計要選的列表:', course.cou_cname);
      return [...prev, newPlannedCourse];
    });
  }, []);

  // 從預計要選的列表中移除課程
  const removeCourseFromPlanned = useCallback((courseId: string) => {
    setPlannedCourses(prev => {
      const filtered = prev.filter(course => course.cou_code !== courseId);
      // 重新編號
      return filtered.map((course, index) => ({
        ...course,
        serialNumber: index + 1
      }));
    });
  }, []);

  // 清空所有預計要選的課程
  const removeAllCoursesFromPlanned = useCallback(() => {
    setPlannedCourses([]);
  }, []);

  // 檢查課程是否已在預計要選的列表中（使用流水號比對）
  const isCourseInPlanned = useCallback((courseId: string) => {
    return plannedCourses.some(course => course.ser_no === courseId);
  }, [plannedCourses]);

  const value: PlannedCoursesContextType = {
    plannedCourses,
    addCourseToPlanned,
    removeCourseFromPlanned,
    removeAllCoursesFromPlanned,
    isCourseInPlanned
  };

  return (
    <PlannedCoursesContext.Provider value={value}>
      {children}
    </PlannedCoursesContext.Provider>
  );
}

// Hook 用於使用 Context
export function usePlannedCourses() {
  const context = useContext(PlannedCoursesContext);
  if (context === undefined) {
    throw new Error('usePlannedCourses must be used within a PlannedCoursesProvider');
  }
  return context;
}
