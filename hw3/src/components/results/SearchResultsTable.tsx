import { memo, useCallback, useMemo } from 'react';
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
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSearchResults, usePagination } from '../../hooks';
import { usePlannedCourses } from '../../contexts/PlannedCoursesContext';
import { useNotification } from '../../hooks/useNotification';
import { CourseTableRow } from '../common/CourseTableRow';
import { Notification } from '../common/Notification';

const SearchResultsTable = memo(() => {
  const { searchResults, isLoading } = useSearchResults();
  const { paginationInfo, goToNextPage, goToPrevPage, getCurrentPageData } = usePagination();
  const { addCourseToPlanned, isCourseInPlanned } = usePlannedCourses();
  const { notification, showSuccess, showWarning, hideNotification } = useNotification();

  const currentPageData = useMemo(() => getCurrentPageData(), [getCurrentPageData]);

  const handleAddToPlanned = useCallback((course: any) => {
    if (isCourseInPlanned(course.ser_no)) {
      showWarning('此課程已經選擇');
    } else {
      addCourseToPlanned(course);
      showSuccess('課程加入成功');
    }
  }, [isCourseInPlanned, addCourseToPlanned, showWarning, showSuccess]);

  const handleTeacherClick = useCallback((teacherName: string, courseName: string) => {
    console.log('教師:', teacherName, '課程:', courseName);
  }, []);

  const tableRows = useMemo(() => 
    currentPageData.map((course, index) => (
      <CourseTableRow 
        key={`${course.cou_code}-${index}`} 
        course={course} 
        index={index}
        onTeacherClick={handleTeacherClick}
        onAddToPlanned={handleAddToPlanned}
        showAddButton={true}
      />
    )), [currentPageData, handleTeacherClick, handleAddToPlanned]
  );

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              114-1 共查詢到 {searchResults.length} 筆課程:
            </Typography>
            <Box>
              <IconButton onClick={goToPrevPage} disabled={paginationInfo.currentPage === 1}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography component="span">第{paginationInfo.currentPage}頁</Typography>
              <IconButton onClick={goToNextPage} disabled={paginationInfo.currentPage === paginationInfo.totalPages}>
                <ChevronRightIcon />
              </IconButton>
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* 課程結果表格 */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>流水號</TableCell>
                  <TableCell>授課對象</TableCell>
                  <TableCell>課號</TableCell>
                  <TableCell>班次</TableCell>
                  <TableCell>課程名稱</TableCell>
                  <TableCell>領域專長</TableCell>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={18} align="center">
                      載入課程數據中...
                    </TableCell>
                  </TableRow>
                ) : currentPageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={18} align="center">
                      暫無課程資料
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 通知組件 */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </>
  );
});

SearchResultsTable.displayName = 'SearchResultsTable';

export { SearchResultsTable };
