import { makeGoogleAPIRequest } from './googleApi';

export interface Route {
  legs: Array<{
    distance: {
      text: string;
      value: number;
    };
    duration: {
      text: string;
      value: number;
    };
    start_address: string;
    end_address: string;
    steps: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      html_instructions: string;
      travel_mode: string;
    }>;
  }>;
  overview_polyline: {
    points: string;
  };
}

export interface DirectionsResponse {
  routes: Route[];
  status: string;
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  startAddress: string;
  endAddress: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
  polyline: string;
}

export class DirectionsService {
  // 計算路線
  static async getDirections(
    origin: string,
    destination: string,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
  ): Promise<DirectionsResult | null> {
    try {
      const response = await makeGoogleAPIRequest('/directions/json', {
        origin: origin,
        destination: destination,
        mode: mode,
        language: 'zh-TW'
      }) as DirectionsResponse;

      if (response.routes.length === 0) {
        return null;
      }

      const route = response.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // 移除 HTML 標籤
          distance: step.distance.text,
          duration: step.duration.text
        })),
        polyline: route.overview_polyline.points
      };
    } catch (error) {
      console.error('計算路線失敗:', error);
      return null;
    }
  }

  // 使用座標計算路線
  static async getDirectionsByCoordinates(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
  ): Promise<DirectionsResult | null> {
    const origin = `${originLat},${originLng}`;
    const destination = `${destLat},${destLng}`;
    
    return this.getDirections(origin, destination, mode);
  }

  // 計算距離和時間（不包含詳細路線）
  static async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
  ): Promise<Array<{
    distance: string;
    duration: string;
    origin: string;
    destination: string;
  }> | null> {
    try {
      const response = await makeGoogleAPIRequest('/distancematrix/json', {
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        mode: mode,
        language: 'zh-TW'
      });

      if (response.status !== 'OK') {
        return null;
      }

      const results: Array<{
        distance: string;
        duration: string;
        origin: string;
        destination: string;
      }> = [];

      response.rows.forEach((row: any, originIndex: number) => {
        row.elements.forEach((element: any, destIndex: number) => {
          if (element.status === 'OK') {
            results.push({
              distance: element.distance.text,
              duration: element.duration.text,
              origin: origins[originIndex],
              destination: destinations[destIndex]
            });
          }
        });
      });

      return results;
    } catch (error) {
      console.error('計算距離矩陣失敗:', error);
      return null;
    }
  }
}
