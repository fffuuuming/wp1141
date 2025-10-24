import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 8 }}>
      <Typography variant="h4" gutterBottom>
        個人資料
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        個人資料頁面正在開發中...
      </Typography>
      <Button variant="contained" onClick={() => navigate('/locations')}>
        返回地點列表
      </Button>
    </Container>
  );
};

export default ProfilePage;
