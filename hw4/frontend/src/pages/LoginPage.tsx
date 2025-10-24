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
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';
import { validateEmail, validatePassword } from '../utils/formValidation';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // 從重導向狀態中取得原始路徑
  const from = (location.state as any)?.from?.pathname || '/locations';

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
    if (name === 'email') {
      const result = validateEmail(value);
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          email: result.error,
        }));
      }
    } else if (name === 'password') {
      const result = validatePassword(value, false); // 登入不需要嚴格驗證
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          password: result.error,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // 前端驗證：在提交前驗證所有欄位
    const errors: { email?: string; password?: string } = {};
    
    // 驗證 Email
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }
    
    // 驗證密碼（登入只需檢查不為空）
    const passwordResult = validatePassword(formData.password, false);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error;
    }
    
    // 如果有任何驗證錯誤，顯示並阻止提交
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // 驗證通過，提交到後端
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      // 只處理業務邏輯錯誤（如密碼錯誤、帳號不存在）
      setError(extractErrorMessage(err));
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
            登入
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
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
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
                '登入'
              )}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2">
                還沒有帳號？{' '}
                <Link component={RouterLink} to="/register">
                  立即註冊
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
