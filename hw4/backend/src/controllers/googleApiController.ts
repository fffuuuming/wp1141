import { Request, Response } from 'express';
import { GeocodingService } from '../services/geocodingService';
import { PlacesService } from '../services/placesService';
import { DirectionsService } from '../services/directionsService';

// Geocoding API 控制器
export class GoogleApiController {
  // 地址轉座標
  static async geocodeAddress(req: Request, res: Response) {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供地址',
          timestamp: new Date().toISOString()
        });
      }

      const results = await GeocodingService.geocodeAddress(address);
      
      res.json({
        message: '地址轉座標成功',
        data: results,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('地址轉座標錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '地址轉座標失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 座標轉地址
  static async reverseGeocode(req: Request, res: Response) {
    try {
      const { lat, lng } = req.body;
      
      if (!lat || !lng) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供緯度和經度',
          timestamp: new Date().toISOString()
        });
      }

      const results = await GeocodingService.reverseGeocode(lat, lng);
      
      res.json({
        message: '座標轉地址成功',
        data: results,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('座標轉地址錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '座標轉地址失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 搜尋附近地點
  static async searchNearby(req: Request, res: Response) {
    try {
      const { lat, lng, radius, type, keyword } = req.body;
      
      if (!lat || !lng) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供緯度和經度',
          timestamp: new Date().toISOString()
        });
      }

      const results = await PlacesService.searchNearby(lat, lng, radius, type, keyword);
      
      res.json({
        message: '搜尋附近地點成功',
        data: results,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('搜尋附近地點錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '搜尋附近地點失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 文字搜尋地點
  static async searchText(req: Request, res: Response) {
    try {
      const { query, location, radius } = req.body;
      
      if (!query) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供搜尋關鍵字',
          timestamp: new Date().toISOString()
        });
      }

      const results = await PlacesService.searchText(query, location, radius);
      
      res.json({
        message: '文字搜尋成功',
        data: results,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('文字搜尋錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '文字搜尋失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 取得地點詳細資訊
  static async getPlaceDetails(req: Request, res: Response) {
    try {
      const { placeId } = req.params;
      
      if (!placeId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供地點 ID',
          timestamp: new Date().toISOString()
        });
      }

      const result = await PlacesService.getPlaceDetails(placeId);
      
      if (!result) {
        return res.status(404).json({
          error: 'Not Found',
          message: '找不到地點詳細資訊',
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        message: '取得地點詳細資訊成功',
        data: result,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('取得地點詳細資訊錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '取得地點詳細資訊失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 計算路線
  static async getDirections(req: Request, res: Response) {
    try {
      const { origin, destination, mode } = req.body;
      
      if (!origin || !destination) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供起點和終點',
          timestamp: new Date().toISOString()
        });
      }

      const result = await DirectionsService.getDirections(origin, destination, mode);
      
      if (!result) {
        return res.status(404).json({
          error: 'Not Found',
          message: '找不到路線',
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        message: '計算路線成功',
        data: result,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('計算路線錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '計算路線失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 計算距離矩陣
  static async getDistanceMatrix(req: Request, res: Response) {
    try {
      const { origins, destinations, mode } = req.body;
      
      if (!origins || !destinations || !Array.isArray(origins) || !Array.isArray(destinations)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供起點和終點陣列',
          timestamp: new Date().toISOString()
        });
      }

      const result = await DirectionsService.getDistanceMatrix(origins, destinations, mode);
      
      if (!result) {
        return res.status(404).json({
          error: 'Not Found',
          message: '無法計算距離',
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        message: '計算距離矩陣成功',
        data: result,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('計算距離矩陣錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '計算距離矩陣失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }
}
