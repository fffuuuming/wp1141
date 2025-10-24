import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sx } from '../../styles';

const AuthButtons: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Box sx={sx.flexBetween}>
      <Button
        variant="outlined"
        onClick={handleLoginClick}
        sx={sx.primaryButton}
      >
        登入
      </Button>
      <Button
        variant="outlined"
        onClick={handleRegisterClick}
        sx={sx.primaryButton}
      >
        註冊
      </Button>
    </Box>
  );
};

export default AuthButtons;
