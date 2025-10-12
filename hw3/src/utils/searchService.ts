import type { CourseData, SearchMethod } from '../types';
import { searchCourses, SearchError } from './csvParser';

// 搜尋結果介面
export interface SearchResult {
  courses: CourseData[];
  totalCount: number;
  searchMethod: SearchMethod;
  searchTerm: string;
  executionTime: number;
}

// 搜尋統計介面
export interface SearchStats {
  totalSearches: number;
  averageExecutionTime: number;
  mostUsedMethod: SearchMethod | null;
  methodUsageCount: Record<SearchMethod, number>;
}

// 搜尋統計類
class SearchStatistics {
  private stats: SearchStats = {
    totalSearches: 0,
    averageExecutionTime: 0,
    mostUsedMethod: null,
    methodUsageCount: {
      courseName: 0,
      teacherName: 0,
      courseCode: 0,
      serialNumber: 0,
      courseId: 0
    }
  };

  private executionTimes: number[] = [];

  recordSearch(method: SearchMethod, executionTime: number): void {
    this.stats.totalSearches++;
    this.stats.methodUsageCount[method]++;
    this.executionTimes.push(executionTime);
    
    // 更新平均執行時間
    this.stats.averageExecutionTime = 
      this.executionTimes.reduce((sum, time) => sum + time, 0) / this.executionTimes.length;
    
    // 更新最常用方法
    const entries = Object.entries(this.stats.methodUsageCount);
    this.stats.mostUsedMethod = entries.reduce((max, [method, count]) => {
      const maxCount = this.stats.methodUsageCount[max as SearchMethod] || 0;
      return count > maxCount ? method as SearchMethod : max;
    }, entries[0][0] as SearchMethod);
  }

  getStats(): SearchStats {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      totalSearches: 0,
      averageExecutionTime: 0,
      mostUsedMethod: null,
      methodUsageCount: {
        courseName: 0,
        teacherName: 0,
        courseCode: 0,
        serialNumber: 0,
        courseId: 0
      }
    };
    this.executionTimes = [];
  }
}

// 全域搜尋統計實例
const searchStats = new SearchStatistics();

// 搜尋服務類
export class SearchService {
  private static instance: SearchService;
  private cache = new Map<string, SearchResult>();

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // 執行搜尋
  async search(
    courses: CourseData[],
    searchMethod: SearchMethod,
    searchTerm: string,
    useCache: boolean = true
  ): Promise<SearchResult> {
    const startTime = performance.now();
    
    try {
      // 生成緩存鍵
      const cacheKey = `${searchMethod}:${searchTerm}:${courses.length}`;
      
      // 檢查緩存
      if (useCache && this.cache.has(cacheKey)) {
        const cachedResult = this.cache.get(cacheKey)!;
        console.log('使用緩存的搜尋結果');
        return cachedResult;
      }
      
      // 執行搜尋
      const searchResults = searchCourses(courses, searchMethod, searchTerm);
      const executionTime = performance.now() - startTime;
      
      // 創建搜尋結果
      const result: SearchResult = {
        courses: searchResults,
        totalCount: searchResults.length,
        searchMethod,
        searchTerm,
        executionTime
      };
      
      // 記錄統計
      searchStats.recordSearch(searchMethod, executionTime);
      
      // 緩存結果
      if (useCache) {
        this.cache.set(cacheKey, result);
      }
      
      console.log(`搜尋完成: ${searchMethod} "${searchTerm}" - ${result.totalCount} 筆結果 (${executionTime.toFixed(2)}ms)`);
      
      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      if (error instanceof SearchError) {
        throw error;
      }
      
      console.error(`搜尋服務錯誤 (${executionTime.toFixed(2)}ms):`, error);
      
      throw new SearchError(
        `搜尋服務錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
        searchMethod
      );
    }
  }

  // 清除緩存
  clearCache(): void {
    this.cache.clear();
    console.log('搜尋緩存已清除');
  }

  // 獲取緩存統計
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // 獲取搜尋統計
  getSearchStats(): SearchStats {
    return searchStats.getStats();
  }

  // 重置搜尋統計
  resetSearchStats(): void {
    searchStats.reset();
    console.log('搜尋統計已重置');
  }
}

// 導出搜尋服務實例
export const searchService = SearchService.getInstance();

// 便捷的搜尋函數
export async function performSearch(
  courses: CourseData[],
  searchMethod: SearchMethod,
  searchTerm: string
): Promise<CourseData[]> {
  const result = await searchService.search(courses, searchMethod, searchTerm);
  return result.courses;
}
