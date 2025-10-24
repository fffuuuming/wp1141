import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Rating,
  FormLabel,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LocationOn, Save, Cancel } from '@mui/icons-material';
import { apiClient } from '../services/api';
import type { CreateLocationRequest } from '../services/api';

// 分類選項
const CATEGORIES = [
  '咖啡廳',
  '餐廳',
  '景點',
  '博物館',
  '公園',
  '商店',
  '其他',
];

const AddLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState<CreateLocationRequest>({
    name: '',
    description: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    category: '',
    rating: undefined,
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoGeocodingFromMap, setAutoGeocodingFromMap] = useState(false);

  // 檢查 URL 參數，如果有座標或 placeId 則自動執行地理編碼
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const placeId = searchParams.get('placeId');
    
    if (placeId && lat && lng) {
      // 有 placeId，表示點擊了地標，使用 Places API 獲取詳細資訊
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        handlePlaceDetails(placeId, latitude, longitude);
      }
    } else if (lat && lng) {
      // 只有座標，表示點擊了空白處，使用反向地理編碼
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        // 設置座標到表單
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
        
        // 自動執行反向地理編碼
        handleReverseGeocode(latitude, longitude);
      }
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // 使用 Place ID 獲取地標詳細資訊
  const handlePlaceDetails = async (placeId: string, lat: number, lng: number) => {
    try {
      setAutoGeocodingFromMap(true);
      setGeocoding(true);
      setError(null);
      
      const response = await apiClient.getPlaceDetails(placeId);
      console.log('Places API 詳細資訊回應:', response);
      
      const placeData = response.data;
      
      if (placeData) {
        // 從 Places API 獲取資訊並填入表單
        const placeName = placeData.name || '';
        const placeAddress = placeData.formatted_address || placeData.vicinity || '';
        const placeRating = placeData.rating ? Math.round(placeData.rating) : undefined;
        const placeTypes = placeData.types || [];
        
        // 根據 Google Places 類型推斷分類
        let category = '';
        if (placeTypes.includes('cafe') || placeTypes.includes('coffee_shop')) {
          category = '咖啡廳';
        } else if (placeTypes.includes('restaurant') || placeTypes.includes('food')) {
          category = '餐廳';
        } else if (placeTypes.includes('tourist_attraction') || placeTypes.includes('point_of_interest')) {
          category = '景點';
        } else if (placeTypes.includes('museum')) {
          category = '博物館';
        } else if (placeTypes.includes('park')) {
          category = '公園';
        } else if (placeTypes.includes('store') || placeTypes.includes('shopping_mall')) {
          category = '商店';
        }
        
        setFormData(prev => ({
          ...prev,
          name: placeName,
          address: placeAddress,
          latitude: lat,
          longitude: lng,
          category: category || prev.category,
          rating: placeRating !== undefined ? placeRating : prev.rating,
        }));
        
        setSuccess(`✅ 已從地圖地標獲取資訊\n🏷️ 名稱：${placeName}\n📮 地址：${placeAddress}\n📍 座標：${lat.toFixed(6)}, ${lng.toFixed(6)}${placeRating ? `\n⭐ 評分：${placeRating} 星` : ''}`);
        setTimeout(() => setSuccess(null), 10000);
      } else {
        // 如果 Places API 失敗，降級使用反向地理編碼
        handleReverseGeocode(lat, lng);
      }
      
    } catch (err: any) {
      console.error('獲取地標資訊錯誤:', err);
      // 如果 Places API 失敗，降級使用反向地理編碼
      console.log('降級使用反向地理編碼...');
      handleReverseGeocode(lat, lng);
    } finally {
      setGeocoding(false);
      setAutoGeocodingFromMap(false);
    }
  };

  // 反向地理編碼（座標轉地址）
  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      setAutoGeocodingFromMap(true);
      setGeocoding(true);
      setError(null);
      
      const response = await apiClient.reverseGeocode(lat, lng);
      console.log('反向地理編碼 API 回應:', response);
      
      // 從反向地理編碼結果中取得第一個地址
      const results = response.data;
      if (Array.isArray(results) && results.length > 0) {
        const address = results[0].formatted_address;
        
        setFormData(prev => ({
          ...prev,
          address,
          latitude: lat,
          longitude: lng,
        }));
        
        setSuccess(`✅ 已從地圖座標獲取地址\n📍 座標：${lat.toFixed(6)}, ${lng.toFixed(6)}\n📮 地址：${address}`);
        setTimeout(() => setSuccess(null), 8000);
      } else {
        setError('無法從座標獲取地址，請手動輸入地址');
      }
      
    } catch (err: any) {
      console.error('反向地理編碼錯誤:', err);
      setError('無法從座標獲取地址：' + (err.response?.data?.message || err.message) + '\n請手動輸入地址');
    } finally {
      setGeocoding(false);
      setAutoGeocodingFromMap(false);
    }
  };

  // 處理輸入變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  // 處理分類選擇
  const handleCategoryChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
    }));
  };

  // 處理評分變更
  const handleRatingChange = (_event: any, newValue: number | null) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || undefined,
    }));
  };

  // 使用地址獲取座標
  const handleGeocodeAddress = async () => {
    if (!formData.address) {
      setError('請先輸入地址');
      return;
    }

    try {
      setGeocoding(true);
      setError(null);
      
      const response = await apiClient.geocode(formData.address);
      console.log('API 回應:', response.data);
      
      const { lat, lng, formatted_address } = response.data;
      
      if (!lat || !lng) {
        throw new Error('無法獲取座標，請確認地址是否正確');
      }
      
      console.log('座標資訊:', { lat, lng, formatted_address });
      
      setFormData(prev => {
        const newData = {
          ...prev,
          latitude: lat,
          longitude: lng,
          address: formatted_address || prev.address || '',
        };
        console.log('更新後的表單:', newData);
        return newData;
      });
      
      setSuccess(`✅ 已成功獲取座標 (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      setError('無法獲取座標：' + (err.response?.data?.message || err.message));
    } finally {
      setGeocoding(false);
    }
  };

  // 表單驗證
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('請輸入地點名稱');
      return false;
    }
    if (!formData.address || (formData.latitude === undefined || formData.longitude === undefined)) {
      setError('請輸入地址並獲取座標');
      console.log('驗證失敗 - 座標資料:', { 
        address: formData.address, 
        latitude: formData.latitude, 
        longitude: formData.longitude 
      });
      return false;
    }
    return true;
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('提交表單 - 當前 formData:', formData);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('準備發送到後端的資料:', formData);
      await apiClient.createLocation(formData);
      
      // 成功後跳轉回地點列表
      navigate('/my-locations', {
        state: { message: '地點新增成功！' }
      });
      
    } catch (err: any) {
      console.error('新增地點錯誤:', err);
      setError('新增地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        pt: 8,
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* 頁面標題 */}
        <Box display="flex" alignItems="center" mb={3}>
          <LocationOn sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">
              新增地點
            </Typography>
            {autoGeocodingFromMap && (
              <Typography variant="caption" color="text.secondary">
                正在從地圖座標獲取地址...
              </Typography>
            )}
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 成功訊息 */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* 表單 */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* 地點名稱 */}
          <TextField
            fullWidth
            required
            label="地點名稱"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
            placeholder="例：星巴克咖啡"
          />

          {/* 描述 */}
          <TextField
            fullWidth
            label="描述"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            disabled={loading}
            placeholder="簡單描述這個地點..."
          />

          {/* 地址和座標 */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              required
              label="地址"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={loading || geocoding}
              placeholder="例：台北市信義區信義路五段7號"
              helperText={
                formData.latitude !== undefined && formData.longitude !== undefined
                  ? `座標：${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                  : '輸入地址後，點擊「獲取座標」按鈕'
              }
            />
            <Button
              variant="outlined"
              onClick={handleGeocodeAddress}
              disabled={loading || geocoding || !formData.address}
              sx={{ mt: 1 }}
              fullWidth
            >
              {geocoding ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  獲取座標中...
                </>
              ) : (
                <>
                  <LocationOn sx={{ mr: 1 }} />
                  獲取座標
                </>
              )}
            </Button>
          </Box>

          {/* 分類 */}
          <FormControl fullWidth margin="normal">
            <InputLabel>分類</InputLabel>
            <Select
              value={formData.category || ''}
              onChange={handleCategoryChange}
              label="分類"
              disabled={loading}
            >
              <MenuItem value="">
                <em>無</em>
              </MenuItem>
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 評分 */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <FormLabel component="legend">評分</FormLabel>
            <Rating
              name="rating"
              value={formData.rating || 0}
              onChange={handleRatingChange}
              disabled={loading}
              size="large"
            />
          </Box>

          {/* 備註 */}
          <TextField
            fullWidth
            label="備註"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
            placeholder="其他想記錄的資訊..."
          />

          {/* 按鈕 */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              {loading ? '儲存中...' : '儲存'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              disabled={loading}
              startIcon={<Cancel />}
              onClick={() => navigate('/my-locations')}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Paper>
      </Container>
    </Box>
  );
};

export default AddLocationPage;
