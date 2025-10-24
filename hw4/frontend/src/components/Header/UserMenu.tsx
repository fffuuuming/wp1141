import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { AccountCircle, KeyboardArrowDown, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserMenuProps {
  onLogoutClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogoutClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMyLocationsClick = () => {
    handleMenuClose();
    navigate('/my-locations');
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    onLogoutClick();
  };

  if (!user) return null;

  return (
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
  );
};

export default UserMenu;
