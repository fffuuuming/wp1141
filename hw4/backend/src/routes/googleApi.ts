import { Router } from 'express';
import { GoogleApiController } from '../controllers/googleApiController';
import { createValidationMiddleware, CustomValidator } from '../middleware/validation';
import { googleApiQuotaCheck, getQuotaStatus } from '../middleware/quotaManagement';

const router = Router();

// Geocoding API 路由（使用地理編碼配額限制）
router.post('/geocode', 
  googleApiQuotaCheck('geocoding'),
  createValidationMiddleware([
    {
      field: 'address',
      rules: [
        { validator: CustomValidator.notEmpty, message: '請提供地址' }
      ]
    }
  ]), 
  GoogleApiController.geocodeAddress
);

router.post('/reverse-geocode', 
  googleApiQuotaCheck('geocoding'),
  createValidationMiddleware([
    {
      field: 'lat',
      rules: [
        { validator: (v) => CustomValidator.isFloat(v, { min: -90, max: 90 }), message: '緯度必須在 -90 到 90 之間' }
      ]
    },
    {
      field: 'lng',
      rules: [
        { validator: (v) => CustomValidator.isFloat(v, { min: -180, max: 180 }), message: '經度必須在 -180 到 180 之間' }
      ]
    }
  ]), 
  GoogleApiController.reverseGeocode
);

// Places API 路由（使用 Places API 配額限制）
router.post('/places/nearby', 
  googleApiQuotaCheck('places'),
  createValidationMiddleware([
  {
    field: 'lat',
    rules: [
      { validator: (v) => CustomValidator.isFloat(v, { min: -90, max: 90 }), message: '緯度必須在 -90 到 90 之間' }
    ]
  },
  {
    field: 'lng',
    rules: [
      { validator: (v) => CustomValidator.isFloat(v, { min: -180, max: 180 }), message: '經度必須在 -180 到 180 之間' }
    ]
  },
  {
    field: 'radius',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isInt(v, { min: 1, max: 50000 })), message: '搜尋半徑必須在 1 到 50000 公尺之間' }
    ]
  }
  ]), 
  GoogleApiController.searchNearby
);

router.post('/places/search', 
  googleApiQuotaCheck('places'),
  createValidationMiddleware([
  {
    field: 'query',
    rules: [
      { validator: CustomValidator.notEmpty, message: '請提供搜尋關鍵字' }
    ]
  }
  ]), 
  GoogleApiController.searchText
);

router.get('/places/details/:placeId', 
  googleApiQuotaCheck('places'),
  GoogleApiController.getPlaceDetails
);

// Directions API 路由（使用 Directions API 配額限制）
router.post('/directions', 
  googleApiQuotaCheck('directions'),
  createValidationMiddleware([
  {
    field: 'origin',
    rules: [
      { validator: CustomValidator.notEmpty, message: '請提供起點' }
    ]
  },
  {
    field: 'destination',
    rules: [
      { validator: CustomValidator.notEmpty, message: '請提供終點' }
    ]
  },
  {
    field: 'mode',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isIn(v, ['driving', 'walking', 'transit', 'bicycling'])), message: '交通方式必須是 driving, walking, transit 或 bicycling' }
    ]
  }
  ]), 
  GoogleApiController.getDirections
);

router.post('/distance-matrix', 
  googleApiQuotaCheck('directions'),
  createValidationMiddleware([
  {
    field: 'origins',
    rules: [
      { validator: (v) => Array.isArray(v) && v.length >= 1, message: '請提供起點陣列' }
    ]
  },
  {
    field: 'destinations',
    rules: [
      { validator: (v) => Array.isArray(v) && v.length >= 1, message: '請提供終點陣列' }
    ]
  },
  {
    field: 'mode',
    rules: [
      { validator: CustomValidator.optional((v) => CustomValidator.isIn(v, ['driving', 'walking', 'transit', 'bicycling'])), message: '交通方式必須是 driving, walking, transit 或 bicycling' }
    ]
  }
  ]), 
  GoogleApiController.getDistanceMatrix
);

// 配額狀態查詢端點
router.get('/quota-status', getQuotaStatus);

export default router;
