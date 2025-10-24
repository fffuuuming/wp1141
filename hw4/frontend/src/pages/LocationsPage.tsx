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
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, Add, LocationOn, Star, Map, ViewList, Place } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import type { Location } from '../services/api';
import GoogleMap, { type MapMarker } from '../components/GoogleMap';

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'both'>('both');
  
  // 搜尋地點相關狀態
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<any[]>([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [placeSearchDialogOpen, setPlaceSearchDialogOpen] = useState(false);

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

      {/* 搜尋欄和視圖切換 */}
      <Box mb={4}>
        {/* 本地地點搜尋 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="搜尋我的地點..."
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

        {/* Google 地點搜尋 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Place />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handlePlaceSearch}
            disabled={placeSearchLoading || !placeSearchQuery.trim()}
            startIcon={placeSearchLoading ? <CircularProgress size={20} /> : <Search />}
            sx={{ minWidth: 120 }}
          >
            {placeSearchLoading ? '搜尋中...' : '搜尋地點'}
          </Button>
        </Box>

        {/* 地圖視圖 */}
        {(viewMode === 'map' || viewMode === 'both') && filteredLocations.length > 0 && (
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                地圖總覽
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                💡 提示：點擊地圖空白處或地標可快速新增地點
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
          </Paper>
        )}
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
      {(viewMode === 'list' || viewMode === 'both') && filteredLocations.length === 0 ? (
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
      ) : (viewMode === 'list' || viewMode === 'both') ? (
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
      ) : null}

      {/* 搜尋結果對話框 */}
      <Dialog
        open={placeSearchDialogOpen}
        onClose={() => setPlaceSearchDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Place sx={{ mr: 1 }} />
            搜尋結果：{placeSearchQuery}
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
                    <ListItemButton onClick={() => handleSelectPlace(place)}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {place.name}
                            </Typography>
                            {place.rating && (
                              <Chip
                                icon={<Star />}
                                label={place.rating.toFixed(1)}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {place.formatted_address}
                            </Typography>
                            {place.types && place.types.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                {place.types.slice(0, 3).map((type: string) => (
                                  <Chip
                                    key={type}
                                    label={type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
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
        <DialogActions>
          <Button onClick={() => setPlaceSearchDialogOpen(false)}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LocationsPage;
