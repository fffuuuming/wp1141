import axios, { AxiosResponse } from 'axios';
import { testConfig, testUtils } from './test-config';

// API 測試工具
export class ApiTestHelper {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = testConfig.api.baseUrl) {
    this.baseUrl = baseUrl;
  }

  // 設定認證 token
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  // 清除認證 token
  clearAuthToken(): void {
    this.authToken = null;
  }

  // 取得請求標頭
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // GET 請求
  async get<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
    return axios.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      timeout: testConfig.api.timeout
    });
  }

  // POST 請求
  async post<T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> {
    return axios.post(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      timeout: testConfig.api.timeout
    });
  }

  // PUT 請求
  async put<T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> {
    return axios.put(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      timeout: testConfig.api.timeout
    });
  }

  // DELETE 請求
  async delete<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
    return axios.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      timeout: testConfig.api.timeout
    });
  }

  // 登入並取得 token
  async login(email: string, password: string): Promise<string> {
    const response = await this.post('/auth/login', { email, password });
    const token = response.data.data.token;
    this.setAuthToken(token);
    return token;
  }

  // 註冊使用者
  async register(username: string, email: string, password: string): Promise<AxiosResponse> {
    return this.post('/auth/register', { username, email, password });
  }

  // 建立測試地點
  async createLocation(locationData: any): Promise<AxiosResponse> {
    return this.post('/locations', locationData);
  }

  // 取得地點清單
  async getLocations(): Promise<AxiosResponse> {
    return this.get('/locations');
  }

  // 測試 Google API
  async testGeocode(address: string): Promise<AxiosResponse> {
    return this.post('/google/geocode', { address });
  }

  // 測試搜尋附近地點
  async testNearbySearch(lat: number, lng: number, radius?: number): Promise<AxiosResponse> {
    return this.post('/google/places/nearby', { lat, lng, radius });
  }
}

// 資料庫測試工具
export class DatabaseTestHelper {
  // 清理測試資料
  static async cleanupTestData(): Promise<void> {
    // 這個函數會在清理腳本中實作
    console.log('🧹 清理測試資料...');
  }

  // 準備測試資料
  static async prepareTestData(): Promise<void> {
    // 這個函數會在設置腳本中實作
    console.log('🧪 準備測試資料...');
  }
}

// 測試斷言工具
export class TestAssertions {
  // 檢查回應狀態
  static assertSuccess(response: AxiosResponse, expectedMessage?: string): void {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Expected success status, got ${response.status}`);
    }

    if (expectedMessage && response.data.message !== expectedMessage) {
      throw new Error(`Expected message "${expectedMessage}", got "${response.data.message}"`);
    }
  }

  // 檢查錯誤回應
  static assertError(response: AxiosResponse, expectedStatus: number, expectedError?: string): void {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }

    if (expectedError && response.data.error !== expectedError) {
      throw new Error(`Expected error "${expectedError}", got "${response.data.error}"`);
    }
  }

  // 檢查資料存在
  static assertDataExists(response: AxiosResponse, dataPath: string): void {
    const data = this.getNestedValue(response.data, dataPath);
    if (!data) {
      throw new Error(`Expected data at path "${dataPath}" to exist`);
    }
  }

  // 檢查資料數量
  static assertDataCount(response: AxiosResponse, expectedCount: number, dataPath: string = 'data'): void {
    const data = this.getNestedValue(response.data, dataPath);
    if (!Array.isArray(data)) {
      throw new Error(`Expected data at path "${dataPath}" to be an array`);
    }

    if (data.length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} items, got ${data.length}`);
    }
  }

  // 取得巢狀物件值
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// 測試執行器
export class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  private results: Array<{ name: string; passed: boolean; error?: string }> = [];

  // 添加測試
  addTest(name: string, testFn: () => Promise<void>): void {
    this.tests.push({ name, fn: testFn });
  }

  // 執行所有測試
  async runAll(): Promise<void> {
    console.log(`🧪 開始執行 ${this.tests.length} 個測試...\n`);

    for (const test of this.tests) {
      try {
        console.log(`▶️ 執行測試: ${test.name}`);
        await test.fn();
        console.log(`✅ 測試通過: ${test.name}`);
        this.results.push({ name: test.name, passed: true });
      } catch (error: any) {
        console.log(`❌ 測試失敗: ${test.name} - ${error.message}`);
        this.results.push({ name: test.name, passed: false, error: error.message });
      }
    }

    this.printSummary();
  }

  // 印出測試摘要
  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    console.log('\n📊 測試摘要:');
    console.log(`   ✅ 通過: ${passed}`);
    console.log(`   ❌ 失敗: ${failed}`);
    console.log(`   📈 總計: ${this.results.length}`);

    if (failed > 0) {
      console.log('\n❌ 失敗的測試:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   - ${result.name}: ${result.error}`);
      });
    }

    if (passed === this.results.length) {
      console.log('\n🎉 所有測試通過！');
    }
  }
}

export { testUtils };
