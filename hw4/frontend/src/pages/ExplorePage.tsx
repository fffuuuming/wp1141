import React, { useState } from 'react';
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
import { Search, Place, Star, Explore, Map } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import GoogleMap, { type MapMarker } from '../components/GoogleMap';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 搜尋地點相關狀態
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<any[]>([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [placeSearchDialogOpen, setPlaceSearchDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 搜尋地點功能
  const handlePlaceSearch = async () => {
    if (!placeSearchQuery.trim()) {
      setError('請輸入搜尋關鍵字');
      return;
    }

    try {
      setPlaceSearchLoading(true);
      setError(null);
      
      const response = await apiClient.searchPlaces(placeSearchQuery);
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
    navigate(`/locations/new?placeId=${place.place_id}&lat=${place.geometry.location.lat}&lng=${place.geometry.location.lng}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5', // 中性淺灰色，與暖色調更和諧
        pt: 8, // 為 Header 留出空間
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
              地點<span className="highlight">探索</span>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mb: 4,
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
              p: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: '#fafafa',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Search sx={{ color: '#ff6b35', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                  搜尋地點
                </Typography>
              </Box>
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
                      <Place sx={{ color: '#ff6b35' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                onClick={handlePlaceSearch}
                disabled={placeSearchLoading || !placeSearchQuery.trim()}
                startIcon={placeSearchLoading ? <CircularProgress size={20} /> : <Search />}
                sx={{
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
                  minWidth: 140,
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
              p: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: '#fafafa',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Map sx={{ color: '#ff6b35', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                地圖總覽
              </Typography>
            </Box>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 2, 
              p: 2,
              border: '1px solid #e0e0e0',
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary', 
                  mb: 2,
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                💡 提示：點擊地圖空白處或地標可快速新增地點
              </Typography>
              <GoogleMap
                center={{ lat: 25.033, lng: 121.5654 }} // 台北 101 預設座標
                zoom={13}
                markers={[]} // 探索頁面不顯示個人地點標記
                onMapClick={(lat, lng, placeId) => {
                  // 點擊地圖時，導航到新增頁面並傳遞座標
                  if (placeId) {
                    // 點擊了地標，傳遞 placeId 和座標
                    navigate(`/locations/new?lat=${lat}&lng=${lng}&placeId=${placeId}`);
                  } else {
                    // 點擊了空白處，只傳遞座標
                    navigate(`/locations/new?lat=${lat}&lng=${lng}`);
                  }
                }}
                height={500}
              />
            </Box>
          </Paper>
        </Fade>

        {/* 錯誤訊息 */}
        {error && (
          <Fade in timeout={1400}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }} 
              onClose={() => setError(null)}
            >
              {error}
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
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
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
