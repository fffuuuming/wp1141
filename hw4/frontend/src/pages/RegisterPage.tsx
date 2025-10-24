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
  Fade,
} from '@mui/material';
import { PersonAdd, Person, Email, Lock, LockOutlined } from '@mui/icons-material';
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
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    
    // 清除該欄位的錯誤訊息
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    
    // 如果修改的是密碼欄位，且確認密碼已有值，清除確認密碼的錯誤
    if (name === 'password' && formData.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: undefined,
      }));
    }
    
    // 如果修改的是確認密碼欄位，清除確認密碼的錯誤
    if (name === 'confirmPassword') {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: undefined,
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
      
      // 如果確認密碼已有值，檢查是否一致
      if (formData.confirmPassword) {
        const confirmResult = validateConfirmPassword(value, formData.confirmPassword);
        if (!confirmResult.isValid) {
          setFieldErrors(prev => ({
            ...prev,
            confirmPassword: confirmResult.error,
          }));
        } else {
          // 如果一致，清除確認密碼的錯誤
          setFieldErrors(prev => ({
            ...prev,
            confirmPassword: undefined,
          }));
        }
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
    setFieldErrors({});

    // 前端驗證：在提交前驗證所有欄位
    const errors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
    
    // 驗證使用者名稱
    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error;
    }
    
    // 驗證 Email
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }
    
    // 驗證密碼
    const passwordResult = validatePassword(formData.password, true);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error;
    }
    
    // 驗證確認密碼
    const confirmResult = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmResult.isValid) {
      errors.confirmPassword = confirmResult.error;
    }
    
    // 如果有任何驗證錯誤，顯示並阻止提交
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // 驗證通過，提交到後端
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/locations');
    } catch (err: any) {
      // 只處理業務邏輯錯誤（如帳號已存在）
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'white',
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
              加入<span className="highlight">探探</span>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mb: 4,
              }}
            >
              創建您的帳號，開始探索精彩世界
            </Typography>
          </Box>
        </Fade>

        {/* 註冊表單 */}
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
                      <Email sx={{ color: '#ff6b35', fontSize: 20 }} />
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || '至少 8 個字元，包含大小寫字母、數字和特殊字元'}
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
                      <LockOutlined sx={{ color: '#ff6b35', fontSize: 20 }} />
                    </Box>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="outlined"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAdd />}
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
                {isLoading ? '註冊中...' : '註冊'}
              </Button>
              
              <Box textAlign="center" sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  已有帳號？{' '}
                  <Link 
                    component={RouterLink} 
                    to="/login"
                    sx={{
                      color: '#ff6b35',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    立即登入
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default RegisterPage;
