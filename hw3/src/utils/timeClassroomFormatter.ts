import type { CourseData } from '../types';

// 節次對應的時間表 (保留供未來使用)
// const TIME_SLOTS = {
//   '0': '7:10~8:00',
//   '1': '8:10~9:00',
//   '2': '9:10~10:00',
//   '3': '10:20~11:10',
//   '4': '11:20~12:10',
//   '5': '12:20~13:10',
//   '6': '13:20~14:10',
//   '7': '14:20~15:10',
//   '8': '15:30~16:20',
//   '9': '16:30~17:20',
//   '10': '17:30~18:20',
//   'A': '18:25~19:15',
//   'B': '19:20~20:10',
//   'C': '20:15~21:05',
//   'D': '21:10~22:00'
// };

// 星期對應的中文
const WEEKDAYS = {
  '1': '一',
  '2': '二',
  '3': '三',
  '4': '四',
  '5': '五',
  '6': '六'
};

// 根據 day 欄位位置確定星期
function getWeekdayFromDayIndex(dayIndex: number): string {
  return WEEKDAYS[dayIndex.toString() as keyof typeof WEEKDAYS] || '';
}

// 將節次字符串轉換為節次範圍
function parseTimeSlots(dayValue: string): string[] {
  if (!dayValue || dayValue.trim() === '') {
    return [];
  }
  
  // 將字符串轉換為字符數組，每個字符代表一個節次
  return dayValue.split('').filter(slot => slot.trim() !== '');
}

// 格式化時間教室信息
export function formatTimeClassroom(course: CourseData): string {
  const timeClassroomPairs: string[] = [];
  
  // 處理 day1-day6 和對應的 clsrom_1-clsrom_6
  for (let i = 1; i <= 6; i++) {
    const dayKey = `day${i}` as keyof CourseData;
    const classroomKey = `clsrom_${i}` as keyof CourseData;
    
    const dayValue = course[dayKey] as string;
    const classroomValue = course[classroomKey] as string;
    
    // 如果有上課時間信息
    if (dayValue && dayValue.trim() !== '') {
      const weekday = getWeekdayFromDayIndex(i);
      const timeSlots = parseTimeSlots(dayValue);
      
      if (weekday && timeSlots.length > 0) {
        // 將節次數字轉換為可讀格式
        const timeSlotsFormatted = timeSlots.map(slot => {
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

// 測試函數 - 用於驗證格式化邏輯
export function testTimeClassroomFormatting() {
  // 測試數據：流水號 77655 的法國文化概述
  const testCourse: CourseData = {
    yyse: '1002',
    ser_no: '77655',
    co_chg: '1',
    dpt_code: '1020',
    year: '#',
    cou_code: '102 46002',
    class: '',
    credit: '4',
    tlec: '4',
    tlab: '0',
    forh: '1',
    sel_code: '3',
    cou_cname: '法國文化概述下',
    cou_ename: 'French Cultural Studies (2)',
    tea_seq: '14209',
    tea_code: '102288',
    tea_cname: '沈志中',
    tea_ename: 'CHIH CHUNG SHEN',
    clsrom_1: '共204',
    clsrom_2: '',
    clsrom_3: '',
    clsrom_4: '共310',
    clsrom_5: '',
    clsrom_6: '',
    st1: '',
    day1: '56',
    st2: '',
    day2: '',
    st3: '',
    day3: '',
    st4: '',
    day4: '56',
    st5: '',
    day5: '',
    st6: '',
    day6: '',
    limit: '25',
    tno: '0',
    eno: '3',
    co_select: '0',
    sno: '法文授課。',
    mark: '0',
    co_rep: '1',
    co_tp: '',
    co_gmark: '1',
    co_eng: '0',
    grpno: '0',
    initsel: '0',
    outside: '',
    pre_course: 'Y',
    dpt_abbr: 'FL',
    cou_teacno: '4038',
    chgitem: '',
    engmark: ''
  };
  
  const result = formatTimeClassroom(testCourse);
  console.log('測試結果:', result); // 應該輸出: "一5,6(共204) 四5,6(共310)"
  return result;
}
