import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  MenuItem,
  Rating,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import apiClient from '../services/api';

interface UpdateLocationRequest {
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  rating?: number;
  notes?: string;
}

const categories = [
  '餐廳',
  '咖啡廳',
  '景點',
  '博物館',
  '公園',
  '商店',
  '飯店',
  '其他',
];

const EditLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<UpdateLocationRequest>({
    name: '',
    description: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    category: '',
    rating: undefined,
    notes: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLocationData();
    }
  }, [id]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLocation(parseInt(id!));
      const location = response.data;
      
      setFormData({
        name: location.name || '',
        description: location.description || '',
        address: location.address || '',
        latitude: location.latitude,
        longitude: location.longitude,
        category: location.category || '',
        rating: location.rating,
        notes: location.notes || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || '無法載入地點資料');
      console.error('載入地點資料失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填欄位
    if (!formData.name || !formData.address) {
      setError('請填寫必填欄位（地點名稱、地址）');
      return;
    }

    // 驗證座標
    if (formData.latitude === undefined || formData.longitude === undefined) {
      setError('請輸入地址並獲取座標');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('提交表單 - 當前 formData:', formData);
      
      // 準備提交的資料
      const submitData: UpdateLocationRequest = {
        name: formData.name,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      // 只添加有值的可選欄位
      if (formData.description) submitData.description = formData.description;
      if (formData.category) submitData.category = formData.category;
      if (formData.rating) submitData.rating = formData.rating;
      if (formData.notes) submitData.notes = formData.notes;

      console.log('準備發送到後端的資料:', submitData);

      await apiClient.updateLocation(parseInt(id!), submitData);
      
      // 成功後跳轉回詳情頁
      navigate(`/locations/${id}`, { 
        state: { message: '地點已成功更新' } 
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || '更新地點失敗');
      console.error('更新地點失敗:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, pt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/locations/${id}`)}
        >
          取消編輯
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        編輯地點
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* 基本資訊 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            基本資訊
          </Typography>
          
          <TextField
            fullWidth
            required
            label="地點名稱"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            disabled={saving}
            sx={{ mb: 2 }}
            placeholder="例：台北101"
          />

          <TextField
            fullWidth
            label="描述"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            disabled={saving}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            placeholder="簡單描述這個地點..."
          />

          {/* 地址和座標 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            位置資訊
          </Typography>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              required
              label="地址"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={saving || geocoding}
              placeholder="例：台北市信義區信義路五段7號"
              helperText={
                formData.latitude !== undefined && formData.longitude !== undefined
                  ? `座標：${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                  : '修改地址後，請重新獲取座標'
              }
            />
            <Button
              variant="outlined"
              onClick={handleGeocodeAddress}
              disabled={saving || geocoding || !formData.address}
              sx={{ mt: 1 }}
            >
              {geocoding ? <CircularProgress size={20} /> : '重新獲取座標'}
            </Button>
          </Box>

          {/* 分類和評分 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            分類與評分
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>分類</InputLabel>
            <Select
              name="category"
              value={formData.category || ''}
              label="分類"
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={saving}
            >
              <MenuItem value="">
                <em>無</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography component="legend" gutterBottom>
              評分
            </Typography>
            <Rating
              name="rating"
              value={formData.rating || 0}
              onChange={(event, newValue) => {
                setFormData(prev => ({ ...prev, rating: newValue || undefined }));
              }}
              disabled={saving}
              precision={0.5}
              size="large"
            />
          </Box>

          {/* 備註 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            備註
          </Typography>

          <TextField
            fullWidth
            label="備註"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={saving}
            multiline
            rows={4}
            sx={{ mb: 3 }}
            placeholder="其他想記錄的資訊..."
          />

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/locations/${id}`)}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? '儲存中...' : '儲存變更'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditLocationPage;

