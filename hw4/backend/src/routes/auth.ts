import { Router } from 'express';
import { register, login, getProfile, updateProfile, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';
import { registerRateLimit } from '../middleware/rateLimiting';

const router = Router();

// 公開路由（前後端雙重驗證：前端提升 UX，後端保證安全）
router.post('/register', registerRateLimit, validateRegister, register); // 註冊使用特殊速率限制
router.post('/login', validateLogin, login);

// 受保護的路由
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

export default router;
