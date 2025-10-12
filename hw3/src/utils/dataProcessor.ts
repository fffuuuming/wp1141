import type { CourseData } from '../types';

// 數據處理工具類
export class DataProcessor {
  // 去重複課程（基於流水號）
  static deduplicateCourses(courses: CourseData[]): CourseData[] {
    const seen = new Set<string>();
    return courses.filter(course => {
      if (seen.has(course.ser_no)) {
        return false;
      }
      seen.add(course.ser_no);
      return true;
    });
  }

  // 排序課程
  static sortCourses(
    courses: CourseData[], 
    sortBy: keyof CourseData, 
    direction: 'asc' | 'desc' = 'asc'
  ): CourseData[] {
    return [...courses].sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  // 分組課程
  static groupCoursesBy<T>(
    courses: CourseData[], 
    groupBy: (course: CourseData) => T
  ): Map<T, CourseData[]> {
    const groups = new Map<T, CourseData[]>();
    
    courses.forEach(course => {
      const key = groupBy(course);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(course);
    });
    
    return groups;
  }

  // 統計課程數據
  static getCourseStats(courses: CourseData[]): {
    total: number;
    byCollege: Record<string, number>;
    byDepartment: Record<string, number>;
    byCredit: Record<string, number>;
    byTeacher: Record<string, number>;
  } {
    const stats = {
      total: courses.length,
      byCollege: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
      byCredit: {} as Record<string, number>,
      byTeacher: {} as Record<string, number>
    };

    courses.forEach(course => {
      // 統計學院
      const collegeCode = course.dpt_code?.substring(0, 4) || 'unknown';
      stats.byCollege[collegeCode] = (stats.byCollege[collegeCode] || 0) + 1;

      // 統計系所
      const departmentCode = course.dpt_code || 'unknown';
      stats.byDepartment[departmentCode] = (stats.byDepartment[departmentCode] || 0) + 1;

      // 統計學分
      const credit = course.credit || 'unknown';
      stats.byCredit[credit] = (stats.byCredit[credit] || 0) + 1;

      // 統計教師
      const teacher = course.tea_cname || 'unknown';
      stats.byTeacher[teacher] = (stats.byTeacher[teacher] || 0) + 1;
    });

    return stats;
  }

  // 過濾空值課程
  static filterValidCourses(courses: CourseData[]): CourseData[] {
    return courses.filter(course => 
      course.ser_no && 
      course.cou_cname && 
      course.cou_cname.trim() !== ''
    );
  }

  // 轉換課程數據格式
  static transformCourseData(course: CourseData): {
    id: string;
    name: string;
    code: string;
    teacher: string;
    credit: string;
    time: string;
    classroom: string;
    department: string;
  } {
    return {
      id: course.ser_no,
      name: course.cou_cname || '',
      code: `${course.dpt_abbr || ''}${course.cou_teacno || ''}`,
      teacher: course.tea_cname || '',
      credit: course.credit || '',
      time: this.formatTimeInfo(course),
      classroom: this.formatClassroomInfo(course),
      department: course.dpt_code || ''
    };
  }

  // 格式化時間信息
  private static formatTimeInfo(course: CourseData): string {
    const timeSlots: string[] = [];
    
    for (let i = 1; i <= 6; i++) {
      const dayKey = `day${i}` as keyof CourseData;
      const dayValue = course[dayKey] as string;
      
      if (dayValue && dayValue.trim() !== '') {
        const weekday = ['', '一', '二', '三', '四', '五', '六'][i];
        timeSlots.push(`週${weekday}${dayValue}`);
      }
    }
    
    return timeSlots.join(' ');
  }

  // 格式化教室信息
  private static formatClassroomInfo(course: CourseData): string {
    const classrooms: string[] = [];
    
    for (let i = 1; i <= 6; i++) {
      const classroomKey = `clsrom_${i}` as keyof CourseData;
      const classroomValue = course[classroomKey] as string;
      
      if (classroomValue && classroomValue.trim() !== '') {
        classrooms.push(classroomValue);
      }
    }
    
    return classrooms.join(' ');
  }

  // 驗證課程數據
  static validateCourseData(course: CourseData): string[] {
    const errors: string[] = [];
    
    if (!course.ser_no) {
      errors.push('缺少流水號');
    }
    
    if (!course.cou_cname || course.cou_cname.trim() === '') {
      errors.push('缺少課程名稱');
    }
    
    if (!course.dpt_code) {
      errors.push('缺少系所代碼');
    }
    
    if (!course.credit || isNaN(Number(course.credit))) {
      errors.push('學分格式不正確');
    }
    
    return errors;
  }

  // 批量驗證課程數據
  static validateCoursesData(courses: CourseData[]): {
    valid: CourseData[];
    invalid: Array<{ course: CourseData; errors: string[] }>;
  } {
    const valid: CourseData[] = [];
    const invalid: Array<{ course: CourseData; errors: string[] }> = [];
    
    courses.forEach(course => {
      const errors = this.validateCourseData(course);
      if (errors.length === 0) {
        valid.push(course);
      } else {
        invalid.push({ course, errors });
      }
    });
    
    return { valid, invalid };
  }
}

// 導出便捷函數
export const deduplicateCourses = DataProcessor.deduplicateCourses;
export const sortCourses = DataProcessor.sortCourses;
export const groupCoursesBy = DataProcessor.groupCoursesBy;
export const getCourseStats = DataProcessor.getCourseStats;
export const filterValidCourses = DataProcessor.filterValidCourses;
export const transformCourseData = DataProcessor.transformCourseData;
export const validateCourseData = DataProcessor.validateCourseData;
export const validateCoursesData = DataProcessor.validateCoursesData;
