import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { body, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得地點清單
router.get('/', [
  query('category').optional().isString().withMessage('分類必須是字串'),
  query('search').optional().isString().withMessage('搜尋關鍵字必須是字串'),
  query('sortBy').optional().isIn(['name', 'category', 'rating', 'created_at', 'updated_at']).withMessage('排序欄位無效'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('排序順序必須是 ASC 或 DESC'),
  handleValidationErrors
], LocationController.getLocations);

// 取得特定地點
router.get('/:id', LocationController.getLocation);

// 新增地點
router.post('/', [
  body('name').notEmpty().withMessage('請提供地點名稱'),
  body('description').optional().isString().withMessage('描述必須是字串'),
  body('address').optional().isString().withMessage('地址必須是字串'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('緯度必須在 -90 到 90 之間'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('經度必須在 -180 到 180 之間'),
  body('category').optional().isString().withMessage('分類必須是字串'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('評分必須在 1 到 5 之間'),
  body('notes').optional().isString().withMessage('備註必須是字串'),
  handleValidationErrors
], LocationController.createLocation);

// 更新地點
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('地點名稱不能為空'),
  body('description').optional().isString().withMessage('描述必須是字串'),
  body('address').optional().isString().withMessage('地址必須是字串'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('緯度必須在 -90 到 90 之間'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('經度必須在 -180 到 180 之間'),
  body('category').optional().isString().withMessage('分類必須是字串'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('評分必須在 1 到 5 之間'),
  body('notes').optional().isString().withMessage('備註必須是字串'),
  handleValidationErrors
], LocationController.updateLocation);

// 刪除地點
router.delete('/:id', LocationController.deleteLocation);

// 取得地點統計
router.get('/stats/summary', LocationController.getLocationStats);

// 從 Google Places 新增地點
router.post('/from-google', [
  body('placeId').notEmpty().withMessage('請提供 Google Place ID'),
  body('category').optional().isString().withMessage('分類必須是字串'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('評分必須在 1 到 5 之間'),
  body('notes').optional().isString().withMessage('備註必須是字串'),
  handleValidationErrors
], LocationController.createFromGooglePlace);

export default router;
