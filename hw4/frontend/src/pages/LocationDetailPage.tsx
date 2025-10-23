import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import NotesIcon from '@mui/icons-material/Notes';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import apiClient, { type Location } from '../services/api';
import GoogleMap from '../components/GoogleMap';

const LocationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location_route = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 檢查是否有成功訊息從其他頁面傳來
  useEffect(() => {
    if (location_route.state?.message) {
      setSuccessMessage(location_route.state.message);
      // 清除 state 中的訊息
      window.history.replaceState({}, document.title);
      // 5 秒後自動清除訊息
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location_route]);

  useEffect(() => {
    if (id) {
      fetchLocationDetail();
    }
  }, [id]);

  const fetchLocationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLocation(parseInt(id!));
      setLocation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '無法載入地點詳情');
      console.error('載入地點詳情失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/locations/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個地點嗎？此操作無法復原。')) {
      return;
    }

    try {
      await apiClient.deleteLocation(parseInt(id!));
      navigate('/locations', { 
        state: { message: '地點已成功刪除' } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || '刪除地點失敗');
      console.error('刪除地點失敗:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !location) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || '找不到該地點'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/locations')}
        >
          返回地點列表
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/locations')}
        >
          返回列表
        </Button>
        <Box>
          <IconButton
            color="primary"
            onClick={handleEdit}
            sx={{ mr: 1 }}
            title="編輯"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={handleDelete}
            title="刪除"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Title and Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {location.name}
          </Typography>
          {location.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating value={location.rating} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({location.rating}/5)
              </Typography>
            </Box>
          )}
        </Box>

        {/* Category */}
        {location.category && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<CategoryIcon />}
              label={location.category}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        {location.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              描述
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {location.description}
            </Typography>
          </Box>
        )}

        {/* Address and Coordinates */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationOnIcon sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                地址
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {location.address || '未提供地址'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                座標：({location.latitude.toFixed(6)}, {location.longitude.toFixed(6)})
              </Typography>
            </Box>
          </Box>

          {/* Google Map */}
          <Box sx={{ mt: 2 }}>
            <GoogleMap
              center={{
                lat: location.latitude,
                lng: location.longitude,
              }}
              zoom={16}
              markers={[
                {
                  id: location.id,
                  position: {
                    lat: location.latitude,
                    lng: location.longitude,
                  },
                  title: location.name,
                  description: location.description,
                },
              ]}
              height={400}
            />
          </Box>
        </Box>

        {/* Notes */}
        {location.notes && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <NotesIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  備註
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {location.notes}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Metadata */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              建立時間：{formatDate(location.created_at)}
            </Typography>
          </Box>
          {location.updated_at !== location.created_at && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                更新時間：{formatDate(location.updated_at)}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          編輯地點
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          刪除地點
        </Button>
      </Box>
    </Container>
  );
};

export default LocationDetailPage;
