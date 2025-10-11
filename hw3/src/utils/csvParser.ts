// CSV 解析工具
export interface CourseData {
  yyse: string;
  ser_no: string;
  co_chg: string;
  dpt_code: string;
  year: string;
  cou_code: string;
  class: string;
  credit: string;
  tlec: string;
  tlab: string;
  forh: string;
  sel_code: string;
  cou_cname: string;
  cou_ename: string;
  tea_seq: string;
  tea_code: string;
  tea_cname: string;
  tea_ename: string;
  clsrom_1: string;
  clsrom_2: string;
  clsrom_3: string;
  clsrom_4: string;
  clsrom_5: string;
  clsrom_6: string;
  st1: string;
  day1: string;
  st2: string;
  day2: string;
  st3: string;
  day3: string;
  st4: string;
  day4: string;
  st5: string;
  day5: string;
  st6: string;
  day6: string;
  limit: string;
  tno: string;
  eno: string;
  co_select: string;
  sno: string;
  mark: string;
  co_rep: string;
  co_tp: string;
  co_gmark: string;
  co_eng: string;
  grpno: string;
  initsel: string;
  outside: string;
  pre_course: string;
  dpt_abbr: string;
  cou_teacno: string;
  chgitem: string;
  engmark: string;
}

// 解析 CSV 字符串為 CourseData 陣列
export function parseCSV(csvText: string): CourseData[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const courses: CourseData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
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
