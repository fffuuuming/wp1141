import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { Explore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartExploring = () => {
    navigate('/explore');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/zelda_1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pt: 8, // 為 Header 留出空間
        px: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // 淺色遮罩，讓背景看起來更淺
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* 抽象圖形 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            mb: 6,
            flexWrap: 'wrap',
          }}
        >
          {/* 左側：重疊圓圈 */}
          <Box sx={{ position: 'relative', width: 60, height: 60 }}>
            <Box
              sx={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: '2px solid black',
                top: 0,
                left: 0,
                opacity: 0.6,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: '2px solid black',
                top: 15,
                left: 15,
                opacity: 0.8,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: '2px solid black',
                top: 30,
                left: 30,
                opacity: 1,
              }}
            />
          </Box>

          {/* 中間：四角星形 */}
          <Box
            sx={{
              width: 50,
              height: 50,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                width: 30,
                height: 30,
                border: '2px solid black',
                borderRadius: 2,
              },
            }}
          />

          {/* 右側：重疊三角形 */}
          <Box sx={{ position: 'relative', width: 60, height: 60 }}>
            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderBottom: '26px solid black',
                top: 0,
                left: 15,
                opacity: 0.6,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderBottom: '26px solid black',
                top: 15,
                left: 22.5,
                opacity: 0.8,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderBottom: '26px solid black',
                top: 30,
                left: 30,
                opacity: 1,
              }}
            />
          </Box>
        </Box>

        {/* 主要標題 */}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            lineHeight: 1.2,
            mb: 4,
            color: 'white',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
            '& .highlight': {
              color: '#ff6b35', // 橘色
            },
          }}
        >
          Explore the world, discover{' '}
          <span className="highlight">wonder</span>
        </Typography>

        {/* 開始探索按鈕 */}
        <Button
          variant="outlined"
          size="large"
          startIcon={<Explore />}
          onClick={handleStartExploring}
          sx={{
            border: '2px solid white',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'white',
            textTransform: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: '#ff6b35',
              borderColor: '#ff6b35',
              color: 'white',
            },
            transition: 'all 0.3s ease',
          }}
        >
          開始探索
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage;