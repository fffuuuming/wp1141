import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PlannedCourse } from '../types';
import { getCourseUniqueId } from '../utils/courseUtils';

interface SelectedCourse {
  id: string;
  serialNumber: string;
  courseCode: string;
  courseId: string;
  classNumber: string;
  courseName: string;
  credits: number;
  instructorName: string;
  priority: number;
  remarks: string;
  timeClassroom: string;
}

interface SelectionResultsContextType {
  selectedCourses: SelectedCourse[];
  usedPriorities: number[];
  addCourse: (course: PlannedCourse, priority: number) => Promise<boolean>;
  getTotalCredits: () => number;
  isCourseImported: (course: PlannedCourse) => boolean;
}

const SelectionResultsContext = createContext<SelectionResultsContextType | undefined>(undefined);

export function SelectionResultsProvider({ children }: { children: ReactNode }) {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [usedPriorities, setUsedPriorities] = useState<number[]>([]);

  const addCourse = async (course: PlannedCourse, priority: number): Promise<boolean> => {
    // 檢查志願序是否已被使用
    if (usedPriorities.includes(priority)) {
      alert('該志願序已被使用，請選擇其他志願序');
      return false;
    }

    // 檢查時間衝突
    const hasConflict = checkTimeConflict(course, selectedCourses);

    if (hasConflict) {
      alert('該時段已有課程');
      return false;
    }

    // 創建新的選課結果
    const newSelectedCourse: SelectedCourse = {
      id: getCourseUniqueId(course),
      serialNumber: course.ser_no || '',
      courseCode: `${course.dpt_abbr || ''}${course.cou_teacno || ''}`,
      courseId: course.cou_code || '',
      classNumber: course.class || '',
      courseName: course.cou_cname || '',
      credits: Number(course.credit) || 0,
      instructorName: course.tea_cname || '',
      priority: priority,
      remarks: course.mark || '',
      timeClassroom: formatTimeClassroom(course),
      // 保存原始時間數據用於衝突檢查
      day1: course.day1,
      day2: course.day2,
      day3: course.day3,
      day4: course.day4,
      day5: course.day5,
      day6: course.day6,
      clsrom_1: course.clsrom_1,
      clsrom_2: course.clsrom_2,
      clsrom_3: course.clsrom_3,
      clsrom_4: course.clsrom_4,
      clsrom_5: course.clsrom_5,
      clsrom_6: course.clsrom_6
    };

    // 更新狀態
    setSelectedCourses(prev => [...prev, newSelectedCourse]);
    setUsedPriorities(prev => [...prev, priority]);

    return true;
  };

  const getTotalCredits = () => {
    return selectedCourses.reduce((total, course) => total + course.credits, 0);
  };

  const isCourseImported = (course: PlannedCourse) => {
    const courseUniqueId = getCourseUniqueId(course);
    return selectedCourses.some(selectedCourse => 
      selectedCourse.id === courseUniqueId
    );
  };

  return (
    <SelectionResultsContext.Provider value={{
      selectedCourses,
      usedPriorities,
      addCourse,
      getTotalCredits,
      isCourseImported
    }}>
      {children}
    </SelectionResultsContext.Provider>
  );
}

export function useSelectionResults() {
  const context = useContext(SelectionResultsContext);
  if (context === undefined) {
    throw new Error('useSelectionResults must be used within a SelectionResultsProvider');
  }
  return context;
}

// 輔助函數：檢查時間衝突
function checkTimeConflict(newCourse: PlannedCourse, existingCourses: SelectedCourse[]): boolean {
  // 獲取新課程的時間段
  const newCourseTimeSlots = getCourseTimeSlots(newCourse);
  
  // 檢查與已選課程的時間衝突
  for (const existingCourse of existingCourses) {
    const existingTimeSlots = parseTimeClassroomString(existingCourse.timeClassroom);
    
    // 檢查是否有同一天且同節次的衝突
    if (hasTimeSlotConflict(newCourseTimeSlots, existingTimeSlots)) {
      return true;
    }
  }
  
  return false;
}

// 輔助函數：獲取課程的時間段
function getCourseTimeSlots(course: PlannedCourse): Array<{day: string, slots: string[]}> {
  const timeSlots: Array<{day: string, slots: string[]}> = [];
  
  // 星期對應
  const WEEKDAYS = {
    '1': '一',
    '2': '二', 
    '3': '三',
    '4': '四',
    '5': '五',
    '6': '六'
  };
  
  // 處理 day1-day6
  for (let i = 1; i <= 6; i++) {
    const dayKey = `day${i}` as keyof PlannedCourse;
    const dayValue = course[dayKey] as string;
    
    if (dayValue && dayValue.trim() !== '') {
      const weekday = WEEKDAYS[i.toString() as keyof typeof WEEKDAYS];
      const slots = dayValue.split('').filter(slot => slot.trim() !== '');
      
      if (weekday && slots.length > 0) {
        timeSlots.push({
          day: weekday,
          slots: slots
        });
      }
    }
  }
  
  return timeSlots;
}

// 輔助函數：解析時間教室字符串
function parseTimeClassroomString(timeClassroom: string): Array<{day: string, slots: string[]}> {
  const timeSlots: Array<{day: string, slots: string[]}> = [];
  
  // 解析格式如 "一5,6(共204) 四5,6(共310)"
  const parts = timeClassroom.split(' ');
  
  for (const part of parts) {
    if (part.trim() === '') continue;
    
    // 提取星期和節次，忽略教室信息
    const match = part.match(/^([一二三四五六])([0-9A-D,]+)/);
    if (match) {
      const day = match[1];
      const slotsString = match[2];
      const slots = slotsString.split(',').filter(slot => slot.trim() !== '');
      
      timeSlots.push({
        day: day,
        slots: slots
      });
    }
  }
  
  return timeSlots;
}

// 輔助函數：檢查時間段衝突
function hasTimeSlotConflict(
  timeSlots1: Array<{day: string, slots: string[]}>, 
  timeSlots2: Array<{day: string, slots: string[]}>
): boolean {
  for (const slot1 of timeSlots1) {
    for (const slot2 of timeSlots2) {
      // 檢查是否同一天
      if (slot1.day === slot2.day) {
        // 檢查是否有相同的節次
        for (const s1 of slot1.slots) {
          for (const s2 of slot2.slots) {
            if (s1 === s2) {
              return true; // 找到衝突
            }
          }
        }
      }
    }
  }
  
  return false;
}

// 輔助函數：格式化時間教室
function formatTimeClassroom(course: PlannedCourse): string {
  const timeClassroomPairs: string[] = [];
  
  // 星期對應
  const WEEKDAYS = {
    '1': '一',
    '2': '二', 
    '3': '三',
    '4': '四',
    '5': '五',
    '6': '六'
  };
  
  // 處理 day1-day6 和對應的 clsrom_1-clsrom_6
  for (let i = 1; i <= 6; i++) {
    const dayKey = `day${i}` as keyof PlannedCourse;
    const classroomKey = `clsrom_${i}` as keyof PlannedCourse;
    
    const dayValue = course[dayKey] as string;
    const classroomValue = course[classroomKey] as string;
    
    // 如果有上課時間信息
    if (dayValue && dayValue.trim() !== '') {
      const weekday = WEEKDAYS[i.toString() as keyof typeof WEEKDAYS];
      const slots = dayValue.split('').filter(slot => slot.trim() !== '');
      
      if (weekday && slots.length > 0) {
        // 將節次數字轉換為可讀格式
        const timeSlotsFormatted = slots.map(slot => {
          // 如果是數字，直接使用
          if (/^\d+$/.test(slot)) {
            return slot;
          }
          // 如果是字母，保持原樣
          return slot;
        }).join(',');
        
        // 使用教室信息，如果沒有則使用默認值
        const classroom = classroomValue && classroomValue.trim() !== '' 
          ? classroomValue 
          : '請洽系所辦';
        
        timeClassroomPairs.push(`${weekday}${timeSlotsFormatted}(${classroom})`);
      }
    }
  }
  
  // 如果沒有任何時間信息，返回默認值
  if (timeClassroomPairs.length === 0) {
    return '請洽系所辦';
  }
  
  return timeClassroomPairs.join(' ');
}
