import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Link,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelectionResults } from '../../contexts/SelectionResultsContext';

interface SelectionResultsPageProps {
  selectedCourses?: any[]; // 之後會定義具體的課程類型
  totalCredits?: number;
}

export function SelectionResultsPage({ 
  selectedCourses: propSelectedCourses, 
  totalCredits: propTotalCredits 
}: SelectionResultsPageProps) {
  const navigate = useNavigate();
  const { selectedCourses: contextSelectedCourses, getTotalCredits } = useSelectionResults();
  
  // 使用context中的數據，如果沒有則使用props
  const selectedCourses = contextSelectedCourses.length > 0 ? contextSelectedCourses : (propSelectedCourses || []);
  const totalCredits = contextSelectedCourses.length > 0 ? getTotalCredits() : (propTotalCredits || 0);

  const handleBackToSearch = () => {
    navigate('/');
  };

  return (
    <Box sx={{ 
      width: '100vw', 
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      py: 4
    }}>
      <Container maxWidth={false} sx={{ px: 0 }}>
        {/* 返回按鈕 */}
        <Container maxWidth="lg" sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBackToSearch}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              px: 3,
              py: 1,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#e3f2fd'
              }
            }}
          >
            ← 返回課程查詢
          </Button>
        </Container>

        {/* 標題 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#1976d2'
            }}
          >
            選課結果
          </Typography>
        </Box>

        {/* 規則說明區域 */}
        <Container maxWidth="lg" sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#1976d2', fontSize: '0.875rem' }}>
            1. 學士班學生每學期校際選課之科目學分數以不超過該學期修習學分總數三分之一為原則。
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: '#1976d2', fontSize: '0.875rem' }}>
            2. 所選學分未達學分下限者,請完成減修學分申請。
            <Link 
              href="#" 
              sx={{ 
                color: '#1976d2', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              請完成減修學分申請
            </Link>
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: '#d32f2f', fontSize: '0.875rem' }}>
            3. NTU COOL 為數位教學平臺,教師可自行於課程中加入成員,但僅視為「旁聽生」(不代表替學生正式加選上此課程),請以本網頁公告為準。
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0, fontSize: '0.875rem' }}>
            4. 跨校修習臺大系統之課程,若尚未於選課結果查詢出現,請靜待三校課程資料交換。
          </Typography>
        </Container>

        {/* 課程表格 - 全寬顯示 */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            mb: 4,
            mx: 0,
            borderRadius: 0,
            boxShadow: 2
          }}
        >
          <Table sx={{ 
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0,
            '& .MuiTableCell-root': {
              borderRight: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
              '&:last-child': {
                borderRight: 'none'
              }
            },
            '& .MuiTableRow-root:last-child .MuiTableCell-root': {
              borderBottom: 'none'
            }
          }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#4db6ac' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '10%' }}>流水號</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '12%' }}>課號</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '15%' }}>課程識別碼</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '8%' }}>班次</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '25%' }}>課程名稱</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '8%' }}>學分</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '15%' }}>教師姓名</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '7%' }}>備註</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2, width: '8%' }}>志願序</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography variant="h5" color="text.secondary">
                      目前沒有選課記錄
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                selectedCourses.map((course, index) => (
                  <TableRow 
                    key={course.id || index}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                      '&:hover': {
                        backgroundColor: '#e3f2fd'
                      }
                    }}
                  >
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.serialNumber || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.courseCode || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.courseId || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.classNumber || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.courseName || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.credits || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.instructorName || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.remarks || ''}</TableCell>
                    <TableCell sx={{ fontSize: '1rem', py: 2 }}>{course.priority || ''}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 學分總計和按鈕 */}
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}>
            <Typography variant="h5" sx={{ fontSize: '1.5rem', color: '#d32f2f', fontWeight: 'bold' }}>
              合計: {totalCredits}學分
            </Typography>

            {/* <Button
              variant="contained"
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              上課時間表
            </Button> */}
          </Box>
        </Container>
      </Container>
    </Box>
  );
}
