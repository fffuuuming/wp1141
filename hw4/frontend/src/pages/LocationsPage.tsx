import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, Add, LocationOn, Star } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import type { Location } from '../services/api';

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 檢查是否有成功訊息從其他頁面傳來
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // 清除 state 中的訊息
      window.history.replaceState({}, document.title);
      // 3 秒後自動清除訊息
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location]);

  // 載入地點資料
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLocations();
      setLocations(response.data);
    } catch (err: any) {
      setError('載入地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 頁面標題 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          我的地點收藏
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/locations/new')}
            sx={{ mr: 2 }}
          >
            新增地點
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            登出
          </Button>
        </Box>
      </Box>

      {/* 搜尋欄 */}
      <Box mb={4}>
        <TextField
          fullWidth
          placeholder="搜尋地點..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 成功訊息 */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 地點列表 */}
      {filteredLocations.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? '找不到符合條件的地點' : '還沒有任何地點'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? '嘗試使用不同的關鍵字搜尋' : '開始新增您喜愛的地點吧！'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/locations/new')}
          >
            新增第一個地點
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredLocations.map((location) => (
            <Card
              key={location.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {location.name}
                </Typography>
                
                {location.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {location.description}
                  </Typography>
                )}

                {location.address && (
                  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {location.address}
                    </Typography>
                  </Box>
                )}

                <Box display="flex" gap={1} flexWrap="wrap">
                  {location.category && (
                    <Chip
                      label={location.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {location.rating && (
                    <Chip
                      icon={<Star />}
                      label={location.rating}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/locations/${location.id}`)}
                >
                  查看詳情
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate(`/locations/${location.id}/edit`)}
                >
                  編輯
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default LocationsPage;
