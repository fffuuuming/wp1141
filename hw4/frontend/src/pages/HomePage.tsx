import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LocationOn, Search, Add, Person } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: '探索地點',
      description: '發現並記錄您喜愛的店家與景點',
      color: '#1976d2',
    },
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: '智能搜尋',
      description: '使用 Google Maps 搜尋附近的地點',
      color: '#388e3c',
    },
    {
      icon: <Add sx={{ fontSize: 40 }} />,
      title: '個人收藏',
      description: '建立您的個人地點收藏清單',
      color: '#f57c00',
    },
    {
      icon: <Person sx={{ fontSize: 40 }} />,
      title: '個人化體驗',
      description: '根據您的喜好推薦地點',
      color: '#7b1fa2',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h1" gutterBottom>
            店家/景點探索平台
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            發現、記錄、分享您喜愛的地點
          </Typography>
          {isAuthenticated ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                歡迎回來，{user?.username}！
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/locations')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                開始探索
              </Button>
            </Box>
          ) : (
            <Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  mr: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                立即註冊
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                登入
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" textAlign="center" gutterBottom>
          功能特色
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          讓探索變得更加簡單有趣
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    color: feature.color,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box
          sx={{
            bgcolor: 'grey.100',
            py: 6,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom>
              準備開始探索了嗎？
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              立即註冊帳號，開始建立您的個人地點收藏
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              免費註冊
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
            >
              已有帳號？登入
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
