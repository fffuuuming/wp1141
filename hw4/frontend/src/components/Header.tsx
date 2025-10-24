import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 子組件
import Logo from './Header/Logo';
import ExplorerButton from './Header/ExplorerButton';
import AuthButtons from './Header/AuthButtons';
import UserMenu from './Header/UserMenu';
import LogoutDialog from './Header/LogoutDialog';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setLogoutDialogOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255, 248, 240, 0.9)', // 淺暖色調，半透明
          borderBottom: '1px solid rgba(255, 107, 53, 0.2)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: 'blur(10px)', // 毛玻璃效果
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          {/* 左側：專案名稱 */}
          <Logo />

          {/* 右側：根據登入狀態顯示不同內容 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Explorer 按鈕 */}
            <ExplorerButton />

            {/* 根據登入狀態顯示不同內容 */}
            {user ? (
              <UserMenu onLogoutClick={handleLogoutClick} />
            ) : (
              <AuthButtons />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 登出確認對話框 */}
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Header;
