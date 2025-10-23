import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
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
      navigate('/locations', {
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* 頁面標題 */}
        <Box display="flex" alignItems="center" mb={3}>
          <LocationOn sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Typography variant="h4">
            新增地點
          </Typography>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 成功訊息 */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
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
              onClick={() => navigate('/locations')}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddLocationPage;
