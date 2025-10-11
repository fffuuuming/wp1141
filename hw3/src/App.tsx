import {
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { AppLayout, QuickSearchForm, DepartmentSearchForm, SearchResultsTable } from './components';
import { useCourseData } from './hooks';

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

// 主應用程式
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<QuickSearchPage />} />
              <Route path="/department" element={<DepartmentSearchPage />} />
            </Routes>
          </AppLayout>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;