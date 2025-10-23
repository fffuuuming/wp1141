import { Router } from 'express';
import { GoogleApiController } from '../controllers/googleApiController';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Geocoding API 路由
router.post('/geocode', [
  body('address').notEmpty().withMessage('請提供地址'),
  handleValidationErrors
], GoogleApiController.geocodeAddress);

router.post('/reverse-geocode', [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('緯度必須在 -90 到 90 之間'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('經度必須在 -180 到 180 之間'),
  handleValidationErrors
], GoogleApiController.reverseGeocode);

// Places API 路由
router.post('/places/nearby', [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('緯度必須在 -90 到 90 之間'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('經度必須在 -180 到 180 之間'),
  body('radius').optional().isInt({ min: 1, max: 50000 }).withMessage('搜尋半徑必須在 1 到 50000 公尺之間'),
  handleValidationErrors
], GoogleApiController.searchNearby);

router.post('/places/search', [
  body('query').notEmpty().withMessage('請提供搜尋關鍵字'),
  handleValidationErrors
], GoogleApiController.searchText);

router.get('/places/details/:placeId', GoogleApiController.getPlaceDetails);

// Directions API 路由
router.post('/directions', [
  body('origin').notEmpty().withMessage('請提供起點'),
  body('destination').notEmpty().withMessage('請提供終點'),
  body('mode').optional().isIn(['driving', 'walking', 'transit', 'bicycling']).withMessage('交通方式必須是 driving, walking, transit 或 bicycling'),
  handleValidationErrors
], GoogleApiController.getDirections);

router.post('/distance-matrix', [
  body('origins').isArray({ min: 1 }).withMessage('請提供起點陣列'),
  body('destinations').isArray({ min: 1 }).withMessage('請提供終點陣列'),
  body('mode').optional().isIn(['driving', 'walking', 'transit', 'bicycling']).withMessage('交通方式必須是 driving, walking, transit 或 bicycling'),
  handleValidationErrors
], GoogleApiController.getDistanceMatrix);

export default router;
