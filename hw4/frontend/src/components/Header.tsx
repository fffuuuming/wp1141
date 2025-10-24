import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import { AccountCircle, Explore, Logout, KeyboardArrowDown } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleMyLocationsClick = () => {
    handleMenuClose();
    navigate('/my-locations');
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate('/explore');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
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

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleExplorerClick = () => {
    navigate('/explore');
  };

  return (
    <>
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* 左側：專案名稱 */}
        <Box 
          onClick={handleLogoClick}
          sx={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: 'black',
              '& .highlight': {
                color: '#ff6b35', // 橘色
              },
            }}
          >
            探<span className="highlight">探</span>
          </Typography>
        </Box>

        {/* 右側：根據登入狀態顯示不同內容 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Explorer 按鈕 */}
          <IconButton
            size="large"
            onClick={handleExplorerClick}
            sx={{ 
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.08)',
              },
            }}
            title="地點探索"
          >
            <Explore />
          </IconButton>

          {/* 根據登入狀態顯示不同內容 */}
          {user ? (
            /* 已登入：顯示頭像下拉選單 */
            <>
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Avatar sx={{ bgcolor: '#ff6b35', width: 32, height: 32 }}>
                  <AccountCircle />
                </Avatar>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: '0.875rem',
                  }}
                >
                  {user.username}
                </Typography>
                <KeyboardArrowDown 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: 20,
                  }} 
                />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem 
                  onClick={handleMyLocationsClick}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.08)',
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    我的地點收藏
                  </Typography>
                </MenuItem>
                <MenuItem 
                  onClick={handleDashboardClick}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.08)',
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    個人檔案
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={handleLogoutClick}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Logout sx={{ fontSize: 20, color: '#ff6b35' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#ff6b35' }}>
                      登出
                    </Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* 未登入：顯示登入和註冊按鈕 */
            <>
              <Button
                variant="outlined"
                onClick={handleLoginClick}
                sx={{
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#ff6b35',
                    color: 'white',
                  },
                }}
              >
                登入
              </Button>
              <Button
                variant="outlined"
                onClick={handleRegisterClick}
                sx={{
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#ff6b35',
                    color: 'white',
                  },
                }}
              >
                註冊
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>

    {/* 登出確認對話框 */}
    <Dialog
      open={logoutDialogOpen}
      onClose={handleLogoutCancel}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 400,
        },
      }}
    >
      <DialogTitle id="logout-dialog-title" sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Logout sx={{ fontSize: 24, color: '#ff6b35' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
            確認登出
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 2 }}>
        <DialogContentText id="logout-dialog-description" sx={{ fontSize: '1rem', color: 'text.secondary' }}>
          您確定要登出嗎？登出後需要重新登入才能使用完整功能。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button
          onClick={handleLogoutCancel}
          variant="outlined"
          sx={{
            border: '2px solid #e0e0e0',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'black',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: '#000',
            },
          }}
        >
          取消
        </Button>
        <Button
          onClick={handleLogoutConfirm}
          variant="outlined"
          sx={{
            border: '2px solid #ff6b35',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#ff6b35',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#ff6b35',
              color: 'white',
            },
          }}
        >
          確認登出
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default Header;
