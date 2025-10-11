import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Link,
  Checkbox
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  Web as WebIcon
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import QuickSearch from './QuickSearch';
import DepartmentSearch from './DepartmentSearch';

// 建立主題
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// 課程資料介面
interface Course {
  serialNumber: string;
  department: string;
  courseCode: string;
  class: string;
  courseName: string;
  expertise: string;
  credits: number;
  courseId: string;
  semester: string;
  requirement: string;
  teacher: string;
  addMethod: string;
  timeClassroom: string;
  totalCapacity: number;
  restrictions: string;
  remarks: string;
  hasWebsite: boolean;
}

// 主應用程式元件
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根據當前路徑決定選中的 tab
  const selectedTab = location.pathname === '/department' ? 'department' : 'quick';
  
  // 狀態管理
  const [courses] = useState<Course[]>([]);
  const [totalResults] = useState(0);
  const [currentPage] = useState(1);

  // 事件處理函數
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'department') {
      navigate('/department');
    } else {
      navigate('/');
    }
  };

  const viewCourseOutline = (courseId: string) => {
    console.log('查看課程大綱:', courseId);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 頂部導航 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          台大課程網
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          您現在的位置: 課程網頁查詢 &gt; {selectedTab === 'department' ? '系所查詢首頁' : '快速查詢首頁'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          114-1修課學分數上下限規定
        </Typography>
        
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="快速" value="quick" />
          <Tab label="系所" value="department" />
        </Tabs>
      </Box>

      {/* 路由內容 */}
      <Routes>
        <Route path="/" element={<QuickSearch />} />
        <Route path="/department" element={<DepartmentSearch />} />
      </Routes>

      {/* 課程搜尋結果區域 */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              114-1 共查詢到 {totalResults} 筆課程:
            </Typography>
            <Box>
              <IconButton><ChevronLeftIcon /></IconButton>
              <Typography component="span">第{currentPage}頁</Typography>
              <IconButton><ChevronRightIcon /></IconButton>
              <IconButton><RefreshIcon /></IconButton>
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
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={18} align="center">
                      暫無課程資料
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map(course => (
                    <TableRow key={course.serialNumber}>
                      <TableCell>{course.serialNumber}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{course.courseCode}</TableCell>
                      <TableCell>{course.class}</TableCell>
                      <TableCell>
                        <Link href="#" onClick={() => viewCourseOutline(course.courseId)}>
                          {course.courseName}
                        </Link>
                      </TableCell>
                      <TableCell>{course.expertise}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.courseId}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{course.requirement}</TableCell>
                      <TableCell>{course.teacher}</TableCell>
                      <TableCell>{course.addMethod}</TableCell>
                      <TableCell>{course.timeClassroom}</TableCell>
                      <TableCell>{course.totalCapacity}</TableCell>
                      <TableCell>{course.restrictions}</TableCell>
                      <TableCell>{course.remarks}</TableCell>
                      <TableCell>
                        {course.hasWebsite && <WebIcon />}
                      </TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

// 主應用程式
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;