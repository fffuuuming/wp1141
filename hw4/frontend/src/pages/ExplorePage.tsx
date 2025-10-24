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
} from '@mui/material';
import { Search, Place, Star } from '@mui/icons-material';
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
    <Container maxWidth="lg" sx={{ py: 4, pt: 8 }}>
      {/* 頁面標題 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          地點探索
        </Typography>
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

      {/* 地圖總覽 */}
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
      </Paper>

      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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

export default ExplorePage;
