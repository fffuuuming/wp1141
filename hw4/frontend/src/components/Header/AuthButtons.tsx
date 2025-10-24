import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AuthButtons: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
    </Box>
  );
};

export default AuthButtons;
