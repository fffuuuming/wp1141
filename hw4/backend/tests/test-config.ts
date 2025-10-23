import { config } from '../src/config';

// 測試配置
export const testConfig = {
  // 測試資料庫路徑
  database: {
    path: './test-database/locations-test.db'
  },
  
  // 測試 API 基礎 URL
  api: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 10000
  },
  
  // 測試使用者
  users: {
    test: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    },
    admin: {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!'
    }
  },
  
  // 測試地點
  locations: {
    coffee: {
      name: '測試咖啡廳',
      description: '這是一個測試咖啡廳',
      address: '台北市信義區信義路五段7號',
      latitude: 25.0330,
      longitude: 121.5654,
      category: '咖啡廳',
      rating: 4,
      notes: '測試備註'
    },
    restaurant: {
      name: '測試餐廳',
      description: '這是一個測試餐廳',
      address: '台北市大安區敦化南路一段236號',
      latitude: 25.0400,
      longitude: 121.5500,
      category: '餐廳',
      rating: 5,
      notes: '測試餐廳備註'
    }
  },
  
  // Google API 測試資料
  google: {
    testAddress: '台北101',
    testCoordinates: {
      lat: 25.0330,
      lng: 121.5654
    }
  }
};

// 測試工具函數
export const testUtils = {
  // 生成隨機字串
  randomString: (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // 生成隨機 email
  randomEmail: (): string => {
    return `test-${testUtils.randomString(8)}@example.com`;
  },
  
  // 等待指定時間
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // 生成測試 token（用於模擬）
  generateTestToken: (): string => {
    return 'test-token-' + testUtils.randomString(20);
  }
};

export default testConfig;
