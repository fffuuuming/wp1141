import {
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { PlannedCoursesProvider } from './contexts/PlannedCoursesContext';
import { AppLayout, QuickSearchForm, DepartmentSearchForm, SearchResultsTable, PlannedCoursesPage } from './components';
import { useCourseData } from './hooks';
import { usePlannedCourses } from './contexts/PlannedCoursesContext';

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

// 數據載入組件
function DataLoader() {
  useCourseData(); // 觸發數據載入
  return null;
}

// 快速搜尋頁面
function QuickSearchPage() {
  return (
    <>
      <DataLoader />
      <QuickSearchForm />
      <SearchResultsTable />
    </>
  );
}

// 系所搜尋頁面
function DepartmentSearchPage() {
  return (
    <>
      <DataLoader />
      <DepartmentSearchForm />
      <SearchResultsTable />
    </>
  );
}

// 預計要選的課程頁面
function PlannedCoursesPageWrapper() {
  const { plannedCourses, removeCourseFromPlanned, removeAllCoursesFromPlanned } = usePlannedCourses();
  const isLoading = false;

  const handleRemoveCourse = (courseId: string) => {
    removeCourseFromPlanned(courseId);
  };

  const handleRemoveAllCourses = () => {
    removeAllCoursesFromPlanned();
  };

  const handleTeacherClick = (teacherName: string, courseName: string) => {
    console.log('教師:', teacherName, '課程:', courseName);
    // TODO: 實現教師點擊的邏輯
  };

  return (
    <PlannedCoursesPage
      plannedCourses={plannedCourses}
      isLoading={isLoading}
      onRemoveCourse={handleRemoveCourse}
      onRemoveAllCourses={handleRemoveAllCourses}
      onTeacherClick={handleTeacherClick}
    />
  );
}

// 主應用程式
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <PlannedCoursesProvider>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/" element={<QuickSearchPage />} />
                <Route path="/department" element={<DepartmentSearchPage />} />
                <Route path="/planned-courses" element={<PlannedCoursesPageWrapper />} />
              </Routes>
            </AppLayout>
          </Router>
        </PlannedCoursesProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;