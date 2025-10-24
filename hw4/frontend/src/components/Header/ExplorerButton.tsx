import React from 'react';
import { IconButton } from '@mui/material';
import { Explore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ExplorerButton: React.FC = () => {
  const navigate = useNavigate();

  const handleExplorerClick = () => {
    navigate('/explore');
  };

  return (
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
  );
};

export default ExplorerButton;
