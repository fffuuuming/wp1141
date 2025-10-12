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
  Paper,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { PlannedCourse } from '../../types';
import { formatTimeClassroom } from '../../utils/timeClassroomFormatter';
import { DEPARTMENT_OPTIONS } from '../../constants/course';
import { getCourseUniqueId } from '../../utils/courseUtils';
import { CourseScheduleTable } from './CourseScheduleTable';

interface PlannedCoursesTableProps {
  plannedCourses: PlannedCourse[];
  isLoading: boolean;
  onRemoveCourse: (courseId: string) => void;
  onRemoveAllCourses: () => void;
  onTeacherClick?: (teacherName: string, courseName: string) => void;
}

export function PlannedCoursesTable({
  plannedCourses,
  isLoading,
  onRemoveCourse,
  onRemoveAllCourses,
  onTeacherClick
}: PlannedCoursesTableProps) {
  const navigate = useNavigate();

  const handleBackToSearch = () => {
    navigate('/');
  };

  const handleGoToSelectionResults = () => {
    navigate('/selection-results');
  };

  return (
    <>
      {/* 返回按鈕和選課結果按鈕 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToSearch}
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem'
          }}
        >
          返回課程查詢
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleGoToSelectionResults}
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem'
          }}
        >
          選課結果
        </Button>
      </Box>

      {/* 頁面標題和說明 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          預計要選的課程列表
        </Typography>
        <Typography 
          variant="body2" 
          color="error" 
          align="center" 
          sx={{ mb: 2 }}
        >
          (僅供參考,您仍需進入選課系統並匯入這些課程,以完成加選登記)
        </Typography>
      </Box>

      <Card>
        <CardContent>

        {/* 課程結果表格 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fffacd' }}>
                <TableCell>序號</TableCell>
                <TableCell>流水號</TableCell>
                <TableCell>授課對象</TableCell>
                <TableCell>課號</TableCell>
                <TableCell>班次</TableCell>
                <TableCell>課程名稱</TableCell>
                <TableCell>學分</TableCell>
                <TableCell>課程識別碼</TableCell>
                <TableCell>全/半年</TableCell>
                <TableCell>必/選修</TableCell>
                <TableCell>授課教師</TableCell>
                <TableCell>加選方式</TableCell>
                <TableCell>時間教室</TableCell>
                <TableCell>總人數</TableCell>
                <TableCell>選課限制條件</TableCell>
                <TableCell>備註</TableCell>
                <TableCell>課程網頁</TableCell>
                <TableCell>本學期我預計要選的課程</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <span>匯入最終課程</span>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#d32f2f', 
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    >
                      下好離手！
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={19} align="center">
                    載入課程數據中...
                  </TableCell>
                </TableRow>
              ) : plannedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={19} align="center">
                    暫無課程資料
                  </TableCell>
                </TableRow>
              ) : (
                plannedCourses.map((course, index) => (
                  <TableRow key={`${course.cou_code}-${index}`}>
                    <TableCell>{course.serialNumber}</TableCell>
                    <TableCell>{course.ser_no || ''}</TableCell>
                    <TableCell>{DEPARTMENT_OPTIONS[course.dpt_code || ''] || course.dpt_code || ''}</TableCell>
                    <TableCell>{`${course.dpt_abbr || ''}${course.cou_teacno || ''}`}</TableCell>
                    <TableCell>{course.class || ''}</TableCell>
                    <TableCell sx={{ color: 'primary.main', cursor: 'pointer' }}>
                      {course.cou_cname || ''}
                    </TableCell>
                    <TableCell>{course.credit || ''}</TableCell>
                    <TableCell>{course.cou_code || ''}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      {course.tea_cname && course.tea_cname.trim() !== '' ? (
                        <Box
                          sx={{ 
                            color: 'primary.main', 
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            '&:hover': {
                              color: 'primary.dark'
                            }
                          }}
                          onClick={() => onTeacherClick?.(course.tea_cname, course.cou_cname || '未知課程')}
                        >
                          {course.tea_cname}
                        </Box>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell>{course.co_select || ''}</TableCell>
                    <TableCell>{formatTimeClassroom(course)}</TableCell>
                    <TableCell>{course.tno || ''}</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{course.mark || ''}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: 'green', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        C
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => onRemoveCourse(getCourseUniqueId(course))}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <InputLabel>志願序</InputLabel>
                          <Select
                            value={1}
                            label="志願序"
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                              <MenuItem key={num} value={num} sx={{ fontSize: '0.875rem' }}>
                                {num}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            px: 1.5,
                            py: 0.5
                          }}
                        >
                          匯入
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 底部刪除所有記錄按鈕 */}
        {plannedCourses.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onRemoveAllCourses}
              sx={{ 
                fontSize: '0.875rem',
                textTransform: 'none'
              }}
            >
              刪除所有記錄
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
    
    {/* 課程時間表 */}
    <CourseScheduleTable plannedCourses={plannedCourses} />
    </>
  );
}
