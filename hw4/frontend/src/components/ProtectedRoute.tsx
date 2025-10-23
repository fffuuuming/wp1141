import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRequireAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, shouldRedirect } = useRequireAuth();
  const location = useLocation();

  // 載入中狀態
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          載入中...
        </Typography>
      </Box>
    );
  }

  // 未認證狀態，重導向到登入頁面
  if (shouldRedirect) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 已認證狀態，渲染子組件
  return <>{children}</>;
};

export default ProtectedRoute;
