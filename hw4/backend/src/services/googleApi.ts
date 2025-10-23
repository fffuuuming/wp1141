import axios from 'axios';

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

if (!GOOGLE_MAPS_SERVER_KEY) {
  console.warn('⚠️ 警告: 未設定 GOOGLE_MAPS_SERVER_KEY 環境變數');
}

// Google API 基礎 URL
const GOOGLE_API_BASE_URL = 'https://maps.googleapis.com/maps/api';

// 通用 Google API 請求函數
async function makeGoogleAPIRequest(endpoint: string, params: Record<string, any>) {
  try {
    const response = await axios.get(`${GOOGLE_API_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        key: GOOGLE_MAPS_SERVER_KEY
      }
    });
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google API 錯誤: ${response.data.status} - ${response.data.error_message || '未知錯誤'}`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Google API 請求失敗:', error.message);
    throw error;
  }
}

export { makeGoogleAPIRequest };
