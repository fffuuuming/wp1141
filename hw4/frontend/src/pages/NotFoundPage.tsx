import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box textAlign="center">
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          頁面不存在
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          抱歉，您訪問的頁面不存在或已被移除。
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          size="large"
        >
          返回首頁
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
