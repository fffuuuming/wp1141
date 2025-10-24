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
} from '@mui/material';
import { AccountCircle, Explore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleExplorerClick = () => {
    navigate('/explore');
  };

  return (
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

        {/* 右側：Explorer 按鈕和頭像下拉選單 */}
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

          {/* 頭像下拉選單 */}
          <IconButton
            size="large"
            onClick={handleMenuOpen}
            sx={{ 
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Avatar sx={{ bgcolor: '#ff6b35' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
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
                個人 Dashboard
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
