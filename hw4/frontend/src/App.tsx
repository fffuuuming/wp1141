import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';

// 頁面組件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import MyLocationsPage from './pages/MyLocationsPage';
import LocationsPage from './pages/LocationsPage';
import AddLocationPage from './pages/AddLocationPage';
import EditLocationPage from './pages/EditLocationPage';
import LocationDetailPage from './pages/LocationDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import TestPage from './pages/TestPage';

// 組件
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// 建立 Material-UI 主題
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// 主要應用程式組件
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header - 在所有頁面都顯示 */}
            <Header />
            
            {/* 主要內容區域 */}
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* 測試路由 */}
                <Route path="/test" element={<TestPage />} />
                
                {/* 公開路由 */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* 受保護的路由 */}
                <Route
                  path="/explore"
                  element={
                    <ProtectedRoute>
                      <ExplorePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-locations"
                  element={
                    <ProtectedRoute>
                      <MyLocationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/locations"
                  element={
                    <ProtectedRoute>
                      <LocationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/locations/new"
                  element={
                    <ProtectedRoute>
                      <AddLocationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/locations/:id"
                  element={
                    <ProtectedRoute>
                      <LocationDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/locations/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditLocationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 頁面 */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;