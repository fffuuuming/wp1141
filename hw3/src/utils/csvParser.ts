import type { CourseData } from '../types';

// 正確解析CSV行，處理引號和逗號
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// 解析 CSV 字符串為 CourseData 陣列
export function parseCSV(csvText: string): CourseData[] {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const courses: CourseData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const course: any = {};
    
    headers.forEach((header, index) => {
      course[header] = values[index] || '';
    });
    
    courses.push(course as CourseData);
  }
  
  return courses;
}

// 根據課程名稱搜尋課程
export function searchCoursesByName(courses: CourseData[], searchTerm: string): CourseData[] {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const trimmedSearchTerm = searchTerm.trim();
  
  return courses.filter(course => 
    course.cou_cname && 
    course.cou_cname.includes(trimmedSearchTerm)
  );
}

// 根據教師姓名搜尋課程
export function searchCoursesByTeacher(courses: CourseData[], searchTerm: string): CourseData[] {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const trimmedSearchTerm = searchTerm.trim();
  
  return courses.filter(course => 
    course.tea_cname && 
    course.tea_cname.includes(trimmedSearchTerm)
  );
}

// 根據課號搜尋課程
export function searchCoursesByCode(courses: CourseData[], searchTerm: string): CourseData[] {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const trimmedSearchTerm = searchTerm.trim();
  
  return courses.filter(course => {
    const courseNumber = `${course.dpt_abbr || ''}${course.cou_teacno || ''}`;
    return courseNumber.includes(trimmedSearchTerm);
  });
}

// 根據流水號搜尋課程
export function searchCoursesBySerialNumber(courses: CourseData[], searchTerm: string): CourseData[] {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const trimmedSearchTerm = searchTerm.trim();
  
  return courses.filter(course => 
    course.ser_no && 
    course.ser_no.includes(trimmedSearchTerm)
  );
}

// 根據課程識別碼搜尋課程
export function searchCoursesById(courses: CourseData[], searchTerm: string): CourseData[] {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const trimmedSearchTerm = searchTerm.trim();
  
  return courses.filter(course => 
    course.cou_code && 
    course.cou_code.includes(trimmedSearchTerm)
  );
}
