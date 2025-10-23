import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LocationDetailPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        地點詳情
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        地點詳情頁面正在開發中...
      </Typography>
      <Button variant="contained" onClick={() => navigate('/locations')}>
        返回地點列表
      </Button>
    </Container>
  );
};

export default LocationDetailPage;
