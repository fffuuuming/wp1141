import React, { useState, useEffect } from 'react';
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
  Fade,
} from '@mui/material';
import { Login, Person, Lock } from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';
import { validateEmailOrUsername, validatePassword } from '../utils/formValidation';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, user } = useAuth();

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});
  const [isNavigating, setIsNavigating] = useState(false);

  // 從重導向狀態中取得原始路徑
  const from = (location.state as any)?.from?.pathname || '/my-locations';

  // 監聽認證狀態變化，登入成功後跳轉
  useEffect(() => {
    if (user && !isLoading) {
      console.log('User authenticated, navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

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
    // 如果正在導航，不進行驗證
    if (isNavigating) return;
    
    const { name, value } = e.target;
    
    // 當欄位失去焦點時進行驗證
    if (name === 'emailOrUsername') {
      const result = validateEmailOrUsername(value);
      if (!result.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          emailOrUsername: result.error,
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
    const errors: { emailOrUsername?: string; password?: string } = {};
    
    // 驗證 Email 或使用者名稱
    const emailOrUsernameResult = validateEmailOrUsername(formData.emailOrUsername);
    if (!emailOrUsernameResult.isValid) {
      errors.emailOrUsername = emailOrUsernameResult.error;
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
      await login(formData.emailOrUsername, formData.password);
      console.log('Login successful');
      // 跳轉將由 useEffect 處理
    } catch (err: any) {
      // 只處理業務邏輯錯誤（如密碼錯誤、帳號不存在）
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pt: 8, // 為 Header 留出空間
        px: 3,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        {/* 頁面標題區域 */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
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
              歡迎<span className="highlight">回來</span>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mb: 4,
              }}
            >
              登入您的帳號，繼續探索精彩世界
            </Typography>
          </Box>
        </Fade>

        {/* 登入表單 */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: '#fafafa',
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 3, 
                  whiteSpace: 'pre-line',
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="emailOrUsername"
                label="電子郵件或使用者名稱"
                name="emailOrUsername"
                autoComplete="username"
                autoFocus
                value={formData.emailOrUsername}
                onChange={handleChange}
                disabled={isLoading}
                error={!!fieldErrors.emailOrUsername}
                helperText={fieldErrors.emailOrUsername}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Person sx={{ color: '#ff6b35', fontSize: 20 }} />
                    </Box>
                  ),
                }}
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
                disabled={isLoading}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Lock sx={{ color: '#ff6b35', fontSize: 20 }} />
                    </Box>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="outlined"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <Login />}
                sx={{
                  mt: 3,
                  mb: 2,
                  border: '2px solid #ff6b35',
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  textTransform: 'none',
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
                {isLoading ? '登入中...' : '登入'}
              </Button>
            </Box>
            
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                還沒有帳號？{' '}
                <Link 
                  component={RouterLink} 
                  to="/register"
                  onMouseDown={() => setIsNavigating(true)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigate('/register');
                  }}
                  sx={{
                    color: '#ff6b35',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  立即註冊
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;
