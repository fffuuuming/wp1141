// 課程類型格式化工具

/**
 * 根據 sel_code 欄位判斷課程類型
 * @param selCode - sel_code 欄位的值
 * @returns 課程類型字符串
 */
export function formatCourseType(selCode: string | undefined): string {
  if (!selCode || selCode.trim() === '') {
    return '';
  }

  switch (selCode.trim()) {
    case '3':
      return '必修';
    case '7':
      return '選修';
    default:
      return ''; // 其他值暫時不顯示
  }
}
