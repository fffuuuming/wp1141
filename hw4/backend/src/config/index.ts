import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// 驗證必要的環境變數
const requiredEnvVars = [
  'JWT_SECRET',
  'GOOGLE_MAPS_SERVER_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️ 警告: 缺少必要的環境變數: ${missingEnvVars.join(', ')}`);
}

// 配置物件
export const config = {
  // 伺服器配置
  server: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // 資料庫配置
  database: {
    path: process.env.DATABASE_PATH || '../database/locations.db'
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Google API 配置
  google: {
    serverKey: process.env.GOOGLE_MAPS_SERVER_KEY || '',
    apiBaseUrl: 'https://maps.googleapis.com/maps/api'
  },

  // CORS 配置
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173']
  }
};

// 配置驗證函數
export function validateConfig(): boolean {
  const isValid = missingEnvVars.length === 0;
  
  if (!isValid) {
    console.error('❌ 配置驗證失敗: 缺少必要的環境變數');
    return false;
  }
  
  console.log('✅ 配置驗證成功');
  return true;
}

// 開發環境配置檢查
export function logConfig(): void {
  if (config.server.nodeEnv === 'development') {
    console.log('🔧 當前配置:');
    console.log(`   - 伺服器端口: ${config.server.port}`);
    console.log(`   - 環境: ${config.server.nodeEnv}`);
    console.log(`   - 前端 URL: ${config.server.frontendUrl}`);
    console.log(`   - 資料庫路徑: ${config.database.path}`);
    console.log(`   - JWT 過期時間: ${config.jwt.expiresIn}`);
    console.log(`   - Google API Key: ${config.google.serverKey ? '已設定' : '未設定'}`);
  }
}
