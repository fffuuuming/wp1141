import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// 載入配置
import { config, validateConfig, logConfig } from './config';

// 載入路由
import authRoutes from './routes/auth';
import googleApiRoutes from './routes/googleApi';
import locationRoutes from './routes/location';

// 載入錯誤處理
import { errorHandler, notFoundHandler } from './utils/errors';
import { sendSuccess } from './utils/response';

const app = express();

// 驗證配置
if (!validateConfig()) {
  console.error('❌ 配置驗證失敗，伺服器無法啟動');
  process.exit(1);
}

// 記錄配置資訊
logConfig();

// 中間件設定
app.use(helmet()); // 安全標頭
app.use(morgan('combined')); // 日誌記錄
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // JSON 解析
app.use(express.urlencoded({ extended: true })); // URL 編碼解析

// 靜態檔案服務 (暫時註解，稍後實作)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 基本路由
app.get('/', (req, res) => {
  sendSuccess(res, 200, '店家/景點探索平台 API', {
    version: '1.0.0',
    status: 'running'
  });
});

// 健康檢查路由
app.get('/health', (req, res) => {
  sendSuccess(res, 200, '服務健康', {
    uptime: process.uptime(),
    environment: config.server.nodeEnv
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/google', googleApiRoutes);
app.use('/api/locations', locationRoutes);

// API 資訊路由
app.get('/api', (req, res) => {
  sendSuccess(res, 200, '店家/景點探索平台 API', {
    version: '1.0.0',
    availableEndpoints: [
      'POST /api/auth/register - 使用者註冊',
      'POST /api/auth/login - 使用者登入',
      'GET /api/auth/profile - 取得使用者資料',
      'PUT /api/auth/profile - 更新使用者資料',
      'POST /api/auth/logout - 使用者登出',
      'POST /api/google/geocode - 地址轉座標',
      'POST /api/google/reverse-geocode - 座標轉地址',
      'POST /api/google/places/nearby - 搜尋附近地點',
      'POST /api/google/places/search - 文字搜尋地點',
      'GET /api/google/places/details/:placeId - 取得地點詳細資訊',
      'POST /api/google/directions - 計算路線',
      'POST /api/google/distance-matrix - 計算距離矩陣',
      'GET /api/locations - 取得地點清單',
      'GET /api/locations/:id - 取得特定地點',
      'POST /api/locations - 新增地點',
      'PUT /api/locations/:id - 更新地點',
      'DELETE /api/locations/:id - 刪除地點',
      'GET /api/locations/stats/summary - 取得地點統計',
      'POST /api/locations/from-google - 從 Google Places 新增地點'
    ]
  });
});

// 404 處理
app.use(notFoundHandler);

// 全域錯誤處理
app.use(errorHandler);

// 啟動伺服器
app.listen(config.server.port, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${config.server.port}`);
  console.log(`📊 健康檢查: http://localhost:${config.server.port}/health`);
  console.log(`🌍 環境: ${config.server.nodeEnv}`);
});

export default app;
