import { Request, Response } from 'express';
import { LocationModel } from '../models/Location';
import { GeocodingService } from '../services/geocodingService';
import { PlacesService } from '../services/placesService';

export interface CreateLocationRequest {
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  rating?: number;
  notes?: string;
}

export class LocationController {
  // 取得使用者的所有地點
  static async getLocations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

      let locations;
      
      const filters: any = {};
      if (search) {
        filters.search = search;
      }
      if (category) {
        filters.category = category;
      }
      
      locations = await LocationModel.findByUserId(userId, filters);

      // 排序
      locations.sort((a: any, b: any) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];
        
        if (sortOrder === 'ASC') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      res.json({
        message: '取得地點清單成功',
        data: locations,
        count: locations.length,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('取得地點清單錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '取得地點清單失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 取得特定地點
  static async getLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const location = await LocationModel.findById(parseInt(id));
      
      if (!location) {
        return res.status(404).json({
          error: 'Not Found',
          message: '找不到地點',
          timestamp: new Date().toISOString()
        });
      }

      // 檢查地點是否屬於當前使用者
      if (location.user_id !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: '您沒有權限存取此地點',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        message: '取得地點成功',
        data: location,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('取得地點錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '取得地點失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 新增地點
  static async createLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const locationData: CreateLocationRequest = req.body;

      // 驗證必要欄位
      if (!locationData.name) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供地點名稱',
          timestamp: new Date().toISOString()
        });
      }

      let latitude = locationData.latitude;
      let longitude = locationData.longitude;
      let address = locationData.address;

      // 如果沒有提供座標但有地址，使用 Geocoding API 取得座標
      if ((!latitude || !longitude) && address) {
        const coordinates = await GeocodingService.getCoordinates(address);
        if (coordinates) {
          latitude = coordinates.lat;
          longitude = coordinates.lng;
        }
      }

      // 如果沒有提供地址但有座標，使用 Reverse Geocoding API 取得地址
      if (!address && latitude && longitude) {
        const formattedAddress = await GeocodingService.getAddress(latitude, longitude);
        if (formattedAddress) {
          address = formattedAddress;
        }
      }

      // 驗證座標
      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '無法取得地點座標，請提供有效的地址或座標',
          timestamp: new Date().toISOString()
        });
      }

      // 建立地點
      const newLocation = await LocationModel.create({
        user_id: userId,
        name: locationData.name,
        description: locationData.description,
        address: address,
        latitude: latitude,
        longitude: longitude,
        category: locationData.category,
        rating: locationData.rating,
        notes: locationData.notes
      });

      res.status(201).json({
        message: '新增地點成功',
        data: newLocation,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('新增地點錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '新增地點失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 更新地點
  static async updateLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const updateData: UpdateLocationRequest = req.body;

      // 檢查地點是否存在
      const existingLocation = await LocationModel.findById(parseInt(id));
      if (!existingLocation) {
        return res.status(404).json({
          error: 'Not Found',
          message: '找不到地點',
          timestamp: new Date().toISOString()
        });
      }

      // 檢查地點是否屬於當前使用者
      if (existingLocation.user_id !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: '您沒有權限修改此地點',
          timestamp: new Date().toISOString()
        });
      }

      let latitude = updateData.latitude || existingLocation.latitude;
      let longitude = updateData.longitude || existingLocation.longitude;
      let address = updateData.address || existingLocation.address;

      // 如果更新了地址，重新取得座標
      if (updateData.address && updateData.address !== existingLocation.address) {
        const coordinates = await GeocodingService.getCoordinates(updateData.address);
        if (coordinates) {
          latitude = coordinates.lat;
          longitude = coordinates.lng;
        }
      }

      // 如果更新了座標，重新取得地址
      if ((updateData.latitude || updateData.longitude) && 
          (updateData.latitude !== existingLocation.latitude || 
           updateData.longitude !== existingLocation.longitude)) {
        const formattedAddress = await GeocodingService.getAddress(latitude, longitude);
        if (formattedAddress) {
          address = formattedAddress;
        }
      }

      // 更新地點
      const updatedLocation = await LocationModel.update(parseInt(id), {
        name: updateData.name,
        description: updateData.description,
        address: address,
        latitude: latitude,
        longitude: longitude,
        category: updateData.category,
        rating: updateData.rating,
        notes: updateData.notes
      });

      res.json({
        message: '更新地點成功',
        data: updatedLocation,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('更新地點錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '更新地點失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 刪除地點
  static async deleteLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // 檢查地點是否存在
      const existingLocation = await LocationModel.findById(parseInt(id));
      if (!existingLocation) {
        return res.status(404).json({
          error: 'Not Found',
          message: '找不到地點',
          timestamp: new Date().toISOString()
        });
      }

      // 檢查地點是否屬於當前使用者
      if (existingLocation.user_id !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: '您沒有權限刪除此地點',
          timestamp: new Date().toISOString()
        });
      }

      // 刪除地點
      await LocationModel.delete(parseInt(id));

      res.json({
        message: '刪除地點成功',
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('刪除地點錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '刪除地點失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 取得地點統計
  static async getLocationStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const stats = await LocationModel.getStats(userId);

      res.json({
        message: '取得地點統計成功',
        data: stats,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('取得地點統計錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '取得地點統計失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  // 從 Google Places 新增地點
  static async createFromGooglePlace(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { placeId, category, rating, notes } = req.body;

      if (!placeId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '請提供 Google Place ID',
          timestamp: new Date().toISOString()
        });
      }

      // 從 Google Places API 取得地點詳細資訊
      const placeDetails = await PlacesService.getPlaceDetails(placeId);
      if (!placeDetails) {
        return res.status(404).json({
          error: 'Not Found',
          message: '找不到 Google Place 資訊',
          timestamp: new Date().toISOString()
        });
      }

      // 建立地點
      const newLocation = await LocationModel.create({
        user_id: userId,
        name: placeDetails.name,
        description: placeDetails.formatted_address,
        address: placeDetails.formatted_address,
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
        category: category || placeDetails.types[0],
        rating: rating || placeDetails.rating,
        notes: notes
      });

      res.status(201).json({
        message: '從 Google Places 新增地點成功',
        data: newLocation,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error: any) {
      console.error('從 Google Places 新增地點錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || '從 Google Places 新增地點失敗',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }
}
