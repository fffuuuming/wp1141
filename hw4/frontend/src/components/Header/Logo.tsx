import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../styles';

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
            color: colors.primary,
          },
        }}
      >
        探<span className="highlight">探</span>
      </Typography>
    </Box>
  );
};

export default Logo;
