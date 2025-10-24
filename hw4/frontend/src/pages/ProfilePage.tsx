import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Divider,
  Chip,
  Fade,
  CircularProgress,
} from '@mui/material';
import { Person, Email, CalendarToday, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    total: number;
    byCategory: Record<string, number>;
    averageRating: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getLocationStats();
        setStats(response.data);
      } catch (err: any) {
        console.error('獲取統計數據失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 8,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          請先登入以查看個人資料
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'white',
        pt: 8, // 為 Header 留出空間
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* 頁面標題區域 */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                color: 'black',
                mb: 1,
                '& .highlight': {
                  color: '#ff6b35',
                },
              }}
            >
              個人<span className="highlight">檔案</span>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mb: 2,
              }}
            >
              查看和管理您的個人資訊
            </Typography>
          </Box>
        </Fade>

        {/* 個人資訊卡片 */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: '#fafafa',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            {/* 頭像區域 */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: '#ff6b35',
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <AccountCircle sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: 'black',
                  mb: 1,
                }}
              >
                {user.username}
              </Typography>
              <Chip
                label="活躍使用者"
                size="small"
                sx={{
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 內容區域 - 使用網格佈局 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* 基本資訊 */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Person sx={{ color: '#ff6b35', fontSize: 20 }} />
                  基本資訊
                </Typography>

                {/* 使用者名稱 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Person sx={{ color: '#ff6b35', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                      使用者名稱
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'black',
                      fontWeight: 'medium',
                      ml: 3,
                    }}
                  >
                    {user.username}
                  </Typography>
                </Box>

                {/* 電子郵件 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Email sx={{ color: '#ff6b35', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                      電子郵件
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'black',
                      fontWeight: 'medium',
                      ml: 3,
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>

                {/* 註冊時間 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CalendarToday sx={{ color: '#ff6b35', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                      註冊時間
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'black',
                      fontWeight: 'medium',
                      ml: 3,
                    }}
                  >
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : '未知'}
                  </Typography>
                </Box>
              </Box>

              {/* 帳號統計 */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AccountCircle sx={{ color: '#ff6b35', fontSize: 20 }} />
                  帳號統計
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#ff6b35', mb: 1 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff6b35', mb: 0.5 }}>
                        {stats?.total || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      收藏地點
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#ff6b35', mb: 1 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff6b35', mb: 0.5 }}>
                        {stats?.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      平均評分
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ProfilePage;
