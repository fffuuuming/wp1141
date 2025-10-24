import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword 
} from '../utils/formValidation';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 清除該欄位的錯誤訊息
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // 清除全局錯誤訊息
    if (error) setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 當欄位失去焦點時進行驗證
    if (name === 'username') {
      const result = validateUsername(value);
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          username: result.error,
        }));
      }
    } else if (name === 'email') {
      const result = validateEmail(value);
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          email: result.error,
        }));
      }
    } else if (name === 'password') {
      const result = validatePassword(value, true); // 註冊需要嚴格驗證
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          password: result.error,
        }));
      }
    } else if (name === 'confirmPassword') {
      const result = validateConfirmPassword(formData.password, value);
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: result.error,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/locations');
    } catch (err: any) {
      // 檢查是否為驗證錯誤（有 details 陣列）
      const data = err.response?.data;
      if (data?.details && Array.isArray(data.details)) {
        // 將驗證錯誤顯示在對應的欄位下方
        const errors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
        data.details.forEach((detail: any) => {
          if (detail.path === 'username') {
            errors.username = detail.msg;
          } else if (detail.path === 'email') {
            errors.email = detail.msg;
          } else if (detail.path === 'password') {
            errors.password = detail.msg;
          }
        });
        setFieldErrors(errors);
      } else {
        // 業務邏輯錯誤（如帳號已存在）顯示在頂部
        setError(extractErrorMessage(err));
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            註冊
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2, whiteSpace: 'pre-line' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="使用者名稱"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username || '3-50 個字元，只能包含字母、數字和底線'}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密碼"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || '至少 8 個字元，包含大小寫字母、數字和特殊字元'}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="確認密碼"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                '註冊'
              )}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2">
                已有帳號？{' '}
                <Link component={RouterLink} to="/login">
                  立即登入
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
