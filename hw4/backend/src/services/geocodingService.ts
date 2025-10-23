import { makeGoogleAPIRequest } from './googleApi';

export interface GeocodingResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

export interface GeocodingResponse {
  results: GeocodingResult[];
  status: string;
}

export interface ReverseGeocodingResult {
  formatted_address: string;
  place_id: string;
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface ReverseGeocodingResponse {
  results: ReverseGeocodingResult[];
  status: string;
}

export class GeocodingService {
  // 地址轉座標
  static async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    try {
      const response = await makeGoogleAPIRequest('/geocode/json', {
        address: address,
        language: 'zh-TW'
      }) as GeocodingResponse;
      
      return response.results;
    } catch (error) {
      console.error('Geocoding 失敗:', error);
      throw new Error('地址轉座標失敗');
    }
  }

  // 座標轉地址
  static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult[]> {
    try {
      const response = await makeGoogleAPIRequest('/geocode/json', {
        latlng: `${lat},${lng}`,
        language: 'zh-TW'
      }) as ReverseGeocodingResponse;
      
      return response.results;
    } catch (error) {
      console.error('Reverse Geocoding 失敗:', error);
      throw new Error('座標轉地址失敗');
    }
  }

  // 取得第一個結果的座標
  static async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const results = await this.geocodeAddress(address);
      if (results.length > 0) {
        return {
          lat: results[0].geometry.location.lat,
          lng: results[0].geometry.location.lng
        };
      }
      return null;
    } catch (error) {
      console.error('取得座標失敗:', error);
      return null;
    }
  }

  // 取得第一個結果的地址
  static async getAddress(lat: number, lng: number): Promise<string | null> {
    try {
      const results = await this.reverseGeocode(lat, lng);
      if (results.length > 0) {
        return results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('取得地址失敗:', error);
      return null;
    }
  }
}
