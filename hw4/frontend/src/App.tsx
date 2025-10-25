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
import AddLocationPage from './pages/AddLocationPage';
import EditLocationPage from './pages/EditLocationPage';
import LocationDetailPage from './pages/LocationDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// 組件
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import { designTokens } from './styles';

// 建立 Material-UI 主題
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.colors.primary,
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: designTokens.colors.background.default,
    },
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: designTokens.typography.fontWeight.bold,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: designTokens.typography.fontWeight.bold,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: designTokens.typography.fontWeight.bold,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: designTokens.typography.fontWeight.bold,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: designTokens.typography.fontWeight.bold,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: designTokens.typography.fontWeight.bold,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: designTokens.borderRadius.md,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.sm,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designTokens.borderRadius.md,
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
                  path="/my-locations/new"
                  element={
                    <ProtectedRoute>
                      <AddLocationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-locations/:id"
                  element={
                    <ProtectedRoute>
                      <LocationDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-locations/:id/edit"
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