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
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Fade,
  Grid,
} from '@mui/material';
import { Search, LocationOn, Star, Map, ViewList } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import type { Location } from '../services/api';
import GoogleMap, { type MapMarker } from '../components/GoogleMap';

const MyLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'both'>('both');

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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5', // 中性淺灰色，與暖色調更和諧
        pt: 8, // 為 Header 留出空間
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* 頁面標題區域 */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                color: 'black',
                mb: 2,
                '& .highlight': {
                  color: '#ff6b35',
                },
              }}
            >
              我的地點<span className="highlight">收藏</span>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mb: 4,
              }}
            >
              管理您喜愛的地點，探索更多精彩
            </Typography>
            
          </Box>
        </Fade>

        {/* 搜尋和視圖控制區域 */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: '#fafafa',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                placeholder="搜尋我的地點..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff6b35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#ff6b35' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_e, newMode) => {
                  if (newMode !== null) {
                    setViewMode(newMode);
                  }
                }}
                aria-label="view mode"
                size="large"
                sx={{
                  '& .MuiToggleButton-root': {
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: '#ff6b35',
                      color: 'white',
                      borderColor: '#ff6b35',
                      '&:hover': {
                        backgroundColor: '#e55a2b',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.08)',
                      borderColor: '#ff6b35',
                    },
                  },
                }}
              >
                <ToggleButton value="list" aria-label="list view">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="both" aria-label="both view">
                  <Map />
                  <ViewList sx={{ ml: 0.5 }} />
                </ToggleButton>
                <ToggleButton value="map" aria-label="map view">
                  <Map />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>
        </Fade>

        {/* 地圖視圖 */}
        {(viewMode === 'map' || viewMode === 'both') && filteredLocations.length > 0 && (
          <Fade in timeout={1200}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                backgroundColor: '#fafafa',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                  我的地點地圖
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  💡 點擊標記查看詳情
                </Typography>
              </Box>
              <GoogleMap
                center={
                  filteredLocations.length > 0
                    ? {
                        lat: filteredLocations[0].latitude,
                        lng: filteredLocations[0].longitude,
                      }
                    : { lat: 25.033, lng: 121.5654 } // 台北 101 預設座標
                }
                zoom={13}
                markers={filteredLocations.map(
                  (loc): MapMarker => ({
                    id: loc.id,
                    position: {
                      lat: loc.latitude,
                      lng: loc.longitude,
                    },
                    title: loc.name,
                    description: loc.description,
                  })
                )}
                onMarkerClick={(marker) => {
                  navigate(`/locations/${marker.id}`);
                }}
                height={500}
              />
            </Paper>
          </Fade>
        )}

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
        {(viewMode === 'list' || viewMode === 'both') && filteredLocations.length === 0 ? (
          <Fade in timeout={1400}>
            <Box textAlign="center" py={8}>
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {searchTerm ? '找不到符合條件的地點' : '還沒有任何地點'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {searchTerm ? '嘗試使用不同的關鍵字搜尋' : '開始新增您喜愛的地點吧！'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/locations/new')}
                sx={{
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#ff6b35',
                    color: 'white',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                新增第一個地點
              </Button>
            </Box>
          </Fade>
        ) : (viewMode === 'list' || viewMode === 'both') ? (
          <Fade in timeout={1400}>
            <Grid container spacing={3}>
              {filteredLocations.map((location, index) => (
                <Grid item xs={12} sm={6} md={4} key={location.id}>
                  <Card
                    onClick={() => navigate(`/locations/${location.id}`)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e0e0e0',
                      borderRadius: 3,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        borderColor: '#ff6b35',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                        {location.name}
                      </Typography>
                      
                      {location.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {location.description}
                        </Typography>
                      )}

                      {location.address && (
                        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: '#ff6b35' }} />
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
                            sx={{
                              backgroundColor: 'rgba(255, 107, 53, 0.1)',
                              color: '#ff6b35',
                              fontWeight: 'bold',
                              border: '1px solid rgba(255, 107, 53, 0.3)',
                            }}
                          />
                        )}
                        {location.rating && (
                          <Chip
                            icon={<Star sx={{ color: '#ff6b35' }} />}
                            label={location.rating}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255, 107, 53, 0.1)',
                              color: '#ff6b35',
                              fontWeight: 'bold',
                              border: '1px solid rgba(255, 107, 53, 0.3)',
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Fade>
        ) : null}
      </Container>
    </Box>
  );
};

export default MyLocationsPage;
