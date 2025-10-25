import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { createValidationMiddleware, CustomValidator } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得地點清單
router.get('/', createValidationMiddleware([
  {
    field: 'category',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '分類必須是字串' }
    ]
  },
  {
    field: 'search',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '搜尋關鍵字必須是字串' }
    ]
  },
  {
    field: 'sortBy',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isIn(v, ['name', 'category', 'rating', 'created_at', 'updated_at'])), message: '排序欄位無效' }
    ]
  },
  {
    field: 'sortOrder',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isIn(v, ['ASC', 'DESC'])), message: '排序順序必須是 ASC 或 DESC' }
    ]
  }
]), LocationController.getLocations);

// 取得特定地點
router.get('/:id', LocationController.getLocation);

// 新增地點
router.post('/', createValidationMiddleware([
  {
    field: 'name',
    rules: [
      { validator: CustomValidator.notEmpty, message: '請提供地點名稱' }
    ]
  },
  {
    field: 'description',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '描述必須是字串' }
    ]
  },
  {
    field: 'address',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '地址必須是字串' }
    ]
  },
  {
    field: 'latitude',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isFloat(v, { min: -90, max: 90 })), message: '緯度必須在 -90 到 90 之間' }
    ]
  },
  {
    field: 'longitude',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isFloat(v, { min: -180, max: 180 })), message: '經度必須在 -180 到 180 之間' }
    ]
  },
  {
    field: 'category',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '分類必須是字串' }
    ]
  },
  {
    field: 'rating',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isInt(v, { min: 1, max: 5 })), message: '評分必須在 1 到 5 之間' }
    ]
  },
  {
    field: 'notes',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '備註必須是字串' }
    ]
  }
]), LocationController.createLocation);

// 更新地點
router.put('/:id', createValidationMiddleware([
  {
    field: 'name',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.notEmpty), message: '地點名稱不能為空' }
    ]
  },
  {
    field: 'description',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '描述必須是字串' }
    ]
  },
  {
    field: 'address',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '地址必須是字串' }
    ]
  },
  {
    field: 'latitude',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isFloat(v, { min: -90, max: 90 })), message: '緯度必須在 -90 到 90 之間' }
    ]
  },
  {
    field: 'longitude',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isFloat(v, { min: -180, max: 180 })), message: '經度必須在 -180 到 180 之間' }
    ]
  },
  {
    field: 'category',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '分類必須是字串' }
    ]
  },
  {
    field: 'rating',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isInt(v, { min: 1, max: 5 })), message: '評分必須在 1 到 5 之間' }
    ]
  },
  {
    field: 'notes',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '備註必須是字串' }
    ]
  }
]), LocationController.updateLocation);

// 刪除地點
router.delete('/:id', LocationController.deleteLocation);

// 取得地點統計
router.get('/stats/summary', LocationController.getLocationStats);

// 從 Google Places 新增地點
router.post('/from-google', createValidationMiddleware([
  {
    field: 'placeId',
    rules: [
      { validator: CustomValidator.notEmpty, message: '請提供 Google Place ID' }
    ]
  },
  {
    field: 'category',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '分類必須是字串' }
    ]
  },
  {
    field: 'rating',
    rules: [
      { validator: CustomValidator.optional((v: any) => CustomValidator.isInt(v, { min: 1, max: 5 })), message: '評分必須在 1 到 5 之間' }
    ]
  },
  {
    field: 'notes',
    rules: [
      { validator: CustomValidator.optional(CustomValidator.isString), message: '備註必須是字串' }
    ]
  }
]), LocationController.createFromGooglePlace);

export default router;
