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
  Link
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSearchResults, usePagination } from '../../hooks';
import { formatTimeClassroom } from '../../utils/timeClassroomFormatter';
import type { CourseData } from '../../types';

interface CourseTableRowProps {
  course: CourseData;
  index: number;
}

function CourseTableRow({ course, index }: CourseTableRowProps) {
  const courseNumber = `${course.dpt_abbr || ''}${course.cou_teacno || ''}`;
  
  return (
    <TableRow key={`${course.cou_code}-${index}`}>
      <TableCell>{course.ser_no || ''}</TableCell>
      <TableCell></TableCell>
      <TableCell>{courseNumber}</TableCell>
      <TableCell>{course.class || ''}</TableCell>
      <TableCell sx={{ color: 'primary.main', cursor: 'pointer' }}>
        {course.cou_cname || ''}
      </TableCell>
      <TableCell></TableCell>
      <TableCell>{course.credit || ''}</TableCell>
      <TableCell>{course.cou_code || ''}</TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        {course.tea_cname && course.tea_cname.trim() !== '' ? (
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // 這裡可以添加點擊教師的處理邏輯
              console.log('教師:', course.tea_cname, '課程:', course.cou_cname);
            }}
            sx={{ 
              color: 'primary.main', 
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            {course.tea_cname}
          </Link>
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
      <TableCell></TableCell>
    </TableRow>
  );
}

export function SearchResultsTable() {
  const { searchResults, isLoading } = useSearchResults();
  const { paginationInfo, goToNextPage, goToPrevPage, getCurrentPageData } = usePagination();

  const currentPageData = getCurrentPageData();

  return (
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
                currentPageData.map((course, index) => (
                  <CourseTableRow key={`${course.cou_code}-${index}`} course={course} index={index} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
