import type { CourseData, SearchMethod } from '../types';

// 搜尋配置介面
interface SearchConfig {
  field: keyof CourseData | ((course: CourseData) => string);
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

// 搜尋方法配置映射
const SEARCH_CONFIGS: Record<SearchMethod, SearchConfig> = {
  courseName: {
    field: 'cou_cname',
    caseSensitive: false
  },
  teacherName: {
    field: 'tea_cname',
    caseSensitive: false
  },
  courseCode: {
    field: (course) => `${course.dpt_abbr || ''}${course.cou_teacno || ''}`,
    caseSensitive: false
  },
  serialNumber: {
    field: 'ser_no',
    caseSensitive: false
  },
  courseId: {
    field: 'cou_code',
    caseSensitive: false
  }
};

// 輸入驗證錯誤類
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// CSV 解析錯誤類
export class CSVParsingError extends Error {
  public lineNumber?: number;
  
  constructor(message: string, lineNumber?: number) {
    super(message);
    this.name = 'CSVParsingError';
    this.lineNumber = lineNumber;
  }
}

// 搜尋錯誤類
export class SearchError extends Error {
  public searchMethod?: SearchMethod;
  
  constructor(message: string, searchMethod?: SearchMethod) {
    super(message);
    this.name = 'SearchError';
    this.searchMethod = searchMethod;
  }
}

// 驗證搜尋輸入
function validateSearchInput(searchTerm: string): void {
  if (typeof searchTerm !== 'string') {
    throw new ValidationError('搜尋關鍵字必須是字符串');
  }
  
  if (searchTerm.length > 100) {
    throw new ValidationError('搜尋關鍵字過長（最大100字符）');
  }
  
  if (searchTerm.trim().length === 0) {
    throw new ValidationError('搜尋關鍵字不能為空');
  }
}

// 驗證課程數據
function validateCourseData(courses: CourseData[]): void {
  if (!Array.isArray(courses)) {
    throw new ValidationError('課程數據必須是陣列');
  }
  
  if (courses.length === 0) {
    throw new ValidationError('課程數據不能為空');
  }
}

// 正確解析CSV行，處理引號和逗號
function parseCSVLine(line: string, lineNumber?: number): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  try {
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
  } catch (error) {
    throw new CSVParsingError(
      `解析CSV行時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
      lineNumber
    );
  }
}

// 解析 CSV 字符串為 CourseData 陣列
export function parseCSV(csvText: string): CourseData[] {
  try {
    if (!csvText || typeof csvText !== 'string') {
      throw new CSVParsingError('CSV文本不能為空或非字符串');
    }

    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new CSVParsingError('CSV文件必須包含標題行和至少一行數據');
    }

    const headers = parseCSVLine(lines[0], 1);
    const courses: CourseData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i], i + 1);
        const course: any = {};
        
        headers.forEach((header, index) => {
          course[header] = values[index] || '';
        });
        
        courses.push(course as CourseData);
      } catch (error) {
        console.warn(`跳過第${i + 1}行，解析錯誤:`, error);
        continue;
      }
    }
    
    return courses;
  } catch (error) {
    if (error instanceof CSVParsingError) {
      throw error;
    }
    throw new CSVParsingError(
      `解析CSV時發生未知錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`
    );
  }
}

// 統一的搜尋函數工廠
function createSearchFunction(searchMethod: SearchMethod) {
  return function(courses: CourseData[], searchTerm: string): CourseData[] {
    try {
      validateSearchInput(searchTerm);
      validateCourseData(courses);
      
      const config = SEARCH_CONFIGS[searchMethod];
      if (!config) {
        throw new SearchError(`不支援的搜尋方法: ${searchMethod}`, searchMethod);
      }
      
      const trimmedSearchTerm = searchTerm.trim();
      const searchValue = config.caseSensitive 
        ? trimmedSearchTerm 
        : trimmedSearchTerm.toLowerCase();
      
      return courses.filter(course => {
        try {
          let fieldValue: string;
          
          if (typeof config.field === 'function') {
            fieldValue = config.field(course);
          } else {
            fieldValue = course[config.field] || '';
          }
          
          if (!fieldValue) {
            return false;
          }
          
          const compareValue = config.caseSensitive 
            ? fieldValue 
            : fieldValue.toLowerCase();
          
          return config.exactMatch 
            ? compareValue === searchValue
            : compareValue.includes(searchValue);
        } catch (error) {
          console.warn(`搜尋課程時發生錯誤:`, error);
          return false;
        }
      });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof SearchError) {
        throw error;
      }
      throw new SearchError(
        `搜尋時發生未知錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
        searchMethod
      );
    }
  };
}

// 根據課程名稱搜尋課程
export const searchCoursesByName = createSearchFunction('courseName');

// 根據教師姓名搜尋課程
export const searchCoursesByTeacher = createSearchFunction('teacherName');

// 根據課號搜尋課程
export const searchCoursesByCode = createSearchFunction('courseCode');

// 根據流水號搜尋課程
export const searchCoursesBySerialNumber = createSearchFunction('serialNumber');

// 根據課程識別碼搜尋課程
export const searchCoursesById = createSearchFunction('courseId');

// 通用搜尋函數
export function searchCourses(
  courses: CourseData[], 
  searchMethod: SearchMethod, 
  searchTerm: string
): CourseData[] {
  const searchFunction = createSearchFunction(searchMethod);
  return searchFunction(courses, searchTerm);
}

// 多條件搜尋
export function searchCoursesMultiple(
  courses: CourseData[],
  searchQueries: Array<{ method: SearchMethod; term: string }>
): CourseData[] {
  try {
    validateCourseData(courses);
    
    if (!Array.isArray(searchQueries) || searchQueries.length === 0) {
      return courses;
    }
    
    let results = courses;
    
    for (const query of searchQueries) {
      try {
        const searchFunction = createSearchFunction(query.method);
        results = searchFunction(results, query.term);
      } catch (error) {
        console.warn(`多條件搜尋中跳過查詢 ${query.method}:`, error);
        continue;
      }
    }
    
    return results;
  } catch (error) {
    throw new SearchError(
      `多條件搜尋時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`
    );
  }
}