import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import type { PlannedCourse } from '../../types';

interface CourseScheduleTableProps {
  plannedCourses: PlannedCourse[];
}

// 時間段定義
const TIME_SLOTS = [
  { period: '0', time: '7:10~8:00' },
  { period: '1', time: '8:10~9:00' },
  { period: '2', time: '9:10~10:00' },
  { period: '3', time: '10:20~11:10' },
  { period: '4', time: '11:20~12:10' },
  { period: '5', time: '12:20~13:10' },
  { period: '6', time: '13:20~14:10' },
  { period: '7', time: '14:20~15:10' },
  { period: '8', time: '15:30~16:20' },
  { period: '9', time: '16:30~17:20' },
  { period: '10', time: '17:30~18:20' },
  { period: 'A', time: '18:25~19:15' },
  { period: 'B', time: '19:20~20:10' },
  { period: 'C', time: '20:15~21:05' },
  { period: 'D', time: '21:10~22:00' }
];

// 星期定義
const WEEKDAYS = ['一', '二', '三', '四', '五', '六'];

// 解析課程時間信息
function parseCourseSchedule(course: PlannedCourse) {
  const schedule: Array<{ weekday: number; periods: string[]; classroom: string }> = [];
  
  // 處理 day1-day6 和對應的 clsrom_1-clsrom_6
  for (let i = 1; i <= 6; i++) {
    const dayKey = `day${i}` as keyof PlannedCourse;
    const classroomKey = `clsrom_${i}` as keyof PlannedCourse;
    
    const dayValue = course[dayKey] as string;
    const classroomValue = course[classroomKey] as string;
    
    if (dayValue && dayValue.trim() !== '') {
      const periods = dayValue.split('').filter(period => period.trim() !== '');
      schedule.push({
        weekday: i,
        periods,
        classroom: classroomValue || '請洽系所辦'
      });
    }
  }
  
  return schedule;
}

export function CourseScheduleTable({ plannedCourses }: CourseScheduleTableProps) {
  // 創建時間表數據結構
  const scheduleData: { [weekday: number]: { [period: string]: { course: PlannedCourse; classroom: string } } } = {};
  
  // 初始化空的時間表
  for (let weekday = 1; weekday <= 6; weekday++) {
    scheduleData[weekday] = {};
    TIME_SLOTS.forEach(slot => {
      scheduleData[weekday][slot.period] = { course: null as any, classroom: '' };
    });
  }
  
  // 填充課程數據
  plannedCourses.forEach(course => {
    const courseSchedule = parseCourseSchedule(course);
    courseSchedule.forEach(({ weekday, periods, classroom }) => {
      periods.forEach(period => {
        if (scheduleData[weekday] && scheduleData[weekday][period]) {
          scheduleData[weekday][period] = { course, classroom };
        }
      });
    });
  });

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          課程時間表
        </Typography>
        
        <TableContainer component={Paper}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fffacd' }}>
                <TableCell sx={{ width: 80, fontWeight: 'bold' }}></TableCell>
                {WEEKDAYS.map(weekday => (
                  <TableCell key={weekday} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {weekday}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map(slot => (
                <TableRow key={slot.period}>
                  <TableCell sx={{ 
                    textAlign: 'center', 
                    verticalAlign: 'top',
                    backgroundColor: '#fffacd'
                  }}>
                    <Box sx={{ fontWeight: 'bold' }}>
                      {slot.period}
                    </Box>
                    <Box sx={{ 
                      fontSize: '0.7rem', 
                      color: 'text.secondary',
                      fontWeight: 'normal'
                    }}>
                      {slot.time}
                    </Box>
                  </TableCell>
                  {WEEKDAYS.map((_, weekdayIndex) => {
                    const weekday = weekdayIndex + 1;
                    const cellData = scheduleData[weekday][slot.period];
                    
                    return (
                      <TableCell 
                        key={weekday} 
                        sx={{ 
                          textAlign: 'center',
                          verticalAlign: 'top',
                          minHeight: 60,
                          border: '1px solid #ddd'
                        }}
                      >
                        {cellData.course ? (
                          <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                            <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {cellData.course.cou_cname}
                            </Box>
                            <Box sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 0.5 }}>
                              ({cellData.course.tea_cname})
                            </Box>
                            <Box sx={{ color: 'error.main', fontWeight: 'bold', fontSize: '0.7rem' }}>
                              {cellData.classroom}
                            </Box>
                          </Box>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
