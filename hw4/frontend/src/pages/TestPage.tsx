import React from 'react';
import { Typography, Box, Container } from '@mui/material';

const TestPage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom>
          測試頁面
        </Typography>
        <Typography variant="h5" color="text.secondary">
          如果您看到這個頁面，表示前端正常運作！
        </Typography>
      </Box>
    </Container>
  );
};

export default TestPage;
