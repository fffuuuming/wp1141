import { makeGoogleAPIRequest } from './googleApi';

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  price_level?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface PlacesResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
}

export interface PlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  price_level?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface PlaceDetailsResponse {
  result: PlaceDetailsResult;
  status: string;
}

export class PlacesService {
  // 搜尋附近地點
  static async searchNearby(
    lat: number,
    lng: number,
    radius: number = 1000,
    type?: string,
    keyword?: string
  ): Promise<PlaceResult[]> {
    try {
      const params: Record<string, any> = {
        location: `${lat},${lng}`,
        radius: radius,
        language: 'zh-TW'
      };

      if (type) {
        params.type = type;
      }

      if (keyword) {
        params.keyword = keyword;
      }

      const response = await makeGoogleAPIRequest('/place/nearbysearch/json', params) as PlacesResponse;
      
      return response.results;
    } catch (error) {
      console.error('搜尋附近地點失敗:', error);
      throw new Error('搜尋附近地點失敗');
    }
  }

  // 文字搜尋地點
  static async searchText(query: string, location?: string, radius?: number): Promise<PlaceResult[]> {
    try {
      const params: Record<string, any> = {
        query: query,
        language: 'zh-TW',
        fields: 'place_id,name,formatted_address,geometry,rating,types,photos'
      };

      if (location) {
        params.location = location;
      }

      if (radius) {
        params.radius = radius;
      }

      const response = await makeGoogleAPIRequest('/place/textsearch/json', params) as PlacesResponse;
      
      return response.results;
    } catch (error) {
      console.error('文字搜尋失敗:', error);
      throw new Error('文字搜尋失敗');
    }
  }

  // 取得地點詳細資訊
  static async getPlaceDetails(placeId: string): Promise<PlaceDetailsResult | null> {
    try {
      const response = await makeGoogleAPIRequest('/place/details/json', {
        place_id: placeId,
        fields: 'place_id,name,formatted_address,formatted_phone_number,website,rating,price_level,types,geometry,opening_hours,photos',
        language: 'zh-TW'
      }) as PlaceDetailsResponse;
      
      return response.result;
    } catch (error) {
      console.error('取得地點詳細資訊失敗:', error);
      return null;
    }
  }

  // 搜尋咖啡廳
  static async searchCoffeeShops(lat: number, lng: number, radius: number = 1000): Promise<PlaceResult[]> {
    return this.searchNearby(lat, lng, radius, 'cafe');
  }

  // 搜尋餐廳
  static async searchRestaurants(lat: number, lng: number, radius: number = 1000): Promise<PlaceResult[]> {
    return this.searchNearby(lat, lng, radius, 'restaurant');
  }

  // 搜尋景點
  static async searchTouristAttractions(lat: number, lng: number, radius: number = 2000): Promise<PlaceResult[]> {
    return this.searchNearby(lat, lng, radius, 'tourist_attraction');
  }
}
