import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
} from '@mui/material';
import { Search, Place, Star, Map, MyLocation } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { googleApi } from '../services/api/index';
import GoogleMap from '../components/GoogleMap';
import { useGeolocation } from '../hooks';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 地理位置相關狀態
  const { 
    latitude, 
    longitude, 
    error: geolocationError, 
    loading: geolocationLoading, 
    getCurrentPosition,
    clearError: clearGeolocationError 
  } = useGeolocation();
  
  // 地圖中心點狀態
  const [mapCenter, setMapCenter] = useState({
    lat: 25.033, // 台北 101 預設座標
    lng: 121.5654
  });
  
  // 搜尋地點相關狀態
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<any[]>([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [placeSearchDialogOpen, setPlaceSearchDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 組件載入時自動獲取用戶位置
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // 當獲取到用戶位置時，更新地圖中心點
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter({
        lat: latitude,
        lng: longitude
      });
    }
  }, [latitude, longitude]);

  // 手動獲取位置的函數
  const handleGetCurrentLocation = () => {
    getCurrentPosition();
  };

  // 搜尋地點功能
  const handlePlaceSearch = async () => {
    if (!placeSearchQuery.trim()) {
      setError('請輸入搜尋關鍵字');
      return;
    }

    try {
      setPlaceSearchLoading(true);
      setError(null);
      
      const response = await googleApi.searchPlaces(placeSearchQuery);
      console.log('搜尋地點結果:', response);
      
      setPlaceSearchResults(response.data.places || []);
      setPlaceSearchDialogOpen(true);
      
    } catch (err: any) {
      console.error('搜尋地點錯誤:', err);
      setError('搜尋地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setPlaceSearchLoading(false);
    }
  };

  // 選擇搜尋結果
  const handleSelectPlace = (place: any) => {
    setPlaceSearchDialogOpen(false);
    // 導航到新增頁面並傳遞 placeId
    navigate(`/my-locations/new?placeId=${place.place_id}&lat=${place.geometry.location.lat}&lng=${place.geometry.location.lng}`);
  };

  // 使用 useCallback 來穩定 onMapClick 函數引用
  const handleMapClick = useCallback((lat: number, lng: number, placeId?: string) => {
    // 點擊地圖時，導航到新增頁面並傳遞座標
    if (placeId) {
      // 點擊了地標，傳遞 placeId 和座標
      navigate(`/my-locations/new?lat=${lat}&lng=${lng}&placeId=${placeId}`);
    } else {
      // 點擊了空白處，只傳遞座標
      navigate(`/my-locations/new?lat=${lat}&lng=${lng}`);
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#f5f5f5',
        pt: 8, // 為 Header 留出空間
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        {/* 頁面標題區域 */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                color: 'black',
                mb: 1,
                '& .highlight': {
                  color: '#ff6b35',
                },
              }}
            >
              地點<span className="highlight">探索</span>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mb: 2,
              }}
            >
              搜尋世界各地的精彩地點，發現新的冒險
            </Typography>
          </Box>
        </Fade>

        {/* Google 地點搜尋區域 */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#fafafa',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Search sx={{ color: '#ff6b35', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'black' }}>
                搜尋地點
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="搜尋 Google 地點（如：台北101、星巴克）..."
                value={placeSearchQuery}
                onChange={(e) => setPlaceSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePlaceSearch();
                  }
                }}
                size="small"
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
                      <Place sx={{ color: '#ff6b35', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                onClick={handlePlaceSearch}
                disabled={placeSearchLoading || !placeSearchQuery.trim()}
                startIcon={placeSearchLoading ? <CircularProgress size={16} /> : <Search />}
                size="small"
                sx={{
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
                  minWidth: 100,
                  '&:hover': {
                    backgroundColor: '#ff6b35',
                    color: 'white',
                  },
                  '&:disabled': {
                    borderColor: '#e0e0e0',
                    color: '#e0e0e0',
                  },
                }}
              >
                {placeSearchLoading ? '搜尋中...' : '搜尋地點'}
              </Button>
            </Box>
          </Paper>
        </Fade>

        {/* 地圖總覽區域 */}
        <Fade in timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#fafafa',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Map sx={{ color: '#ff6b35', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'black' }}>
                  地圖總覽
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGetCurrentLocation}
                disabled={geolocationLoading}
                startIcon={geolocationLoading ? <CircularProgress size={16} /> : <MyLocation />}
                sx={{
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
                  minWidth: 100,
                  '&:hover': {
                    backgroundColor: '#ff6b35',
                    color: 'white',
                  },
                  '&:disabled': {
                    borderColor: '#e0e0e0',
                    color: '#e0e0e0',
                  },
                }}
              >
                {geolocationLoading ? '定位中...' : '我的位置'}
              </Button>
            </Box>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 2, 
              p: 1,
              border: '1px solid #e0e0e0',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  mb: 1,
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                💡 提示：點擊地圖空白處或地標可快速新增地點
              </Typography>
              <Box sx={{ flex: 1 }}>
                <GoogleMap
                  center={mapCenter}
                  zoom={14}
                  markers={[]} // 探索頁面不顯示個人地點標記
                  onMapClick={handleMapClick}
                  height="100%"
                />
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* 錯誤訊息 */}
        {(error || geolocationError) && (
          <Fade in timeout={1400}>
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
              }} 
              onClose={() => {
                setError(null);
                clearGeolocationError();
              }}
            >
              {error || geolocationError}
            </Alert>
          </Fade>
        )}

      {/* 搜尋結果對話框 */}
      <Dialog
        open={placeSearchDialogOpen}
        onClose={() => setPlaceSearchDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Place sx={{ color: '#ff6b35', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
              搜尋結果：{placeSearchQuery}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {placeSearchResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                找不到符合條件的地點
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                請嘗試使用不同的關鍵字搜尋
              </Typography>
            </Box>
          ) : (
            <List>
              {placeSearchResults.map((place, index) => (
                <React.Fragment key={place.place_id}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleSelectPlace(place)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 107, 53, 0.08)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" component="div" sx={{ color: 'black' }}>
                              {place.name}
                            </Typography>
                            {place.rating && (
                              <Chip
                                icon={<Star sx={{ fontSize: 16 }} />}
                                label={place.rating.toFixed(1)}
                                size="small"
                                sx={{
                                  backgroundColor: '#ff6b35',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  '& .MuiChip-icon': {
                                    color: 'white',
                                  },
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                              {place.formatted_address}
                            </Typography>
                            {place.types && place.types.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {place.types.slice(0, 3).map((type: string) => (
                                  <Chip
                                    key={type}
                                    label={type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      mr: 0.5, 
                                      mb: 0.5,
                                      borderColor: '#ff6b35',
                                      color: '#ff6b35',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 107, 53, 0.08)',
                                      },
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                        primaryTypographyProps={{
                          component: 'div'
                        }}
                        secondaryTypographyProps={{
                          component: 'div'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < placeSearchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPlaceSearchDialogOpen(false)}
            variant="outlined"
            sx={{
              border: '2px solid #e0e0e0',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: 'bold',
              color: 'black',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderColor: '#000',
              },
            }}
          >
            關閉
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default ExplorePage;
