import { Router } from 'express';
import { register, login, getProfile, updateProfile, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

// 公開路由
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// 受保護的路由
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

export default router;
