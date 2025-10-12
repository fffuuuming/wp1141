// 課程唯一標識符工具
export const generateCourseId = (serNo: string, dptCode: string): string => {
  return `${serNo}_${dptCode}`;
};

// 從課程數據生成唯一 ID
export const getCourseUniqueId = (course: { ser_no?: string; dpt_code?: string }): string => {
  return generateCourseId(course.ser_no || '', course.dpt_code || '');
};
