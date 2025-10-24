import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
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
  );
};

export default Logo;
