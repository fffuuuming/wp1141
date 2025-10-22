import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 基本中間件
app.use(cors());
app.use(express.json());

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: '店家/景點探索平台 API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.get('/api', (req, res) => {
  res.json({
    message: 'API 路由將在此處設定',
    availableEndpoints: [
      'GET /api/auth/profile',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/locations',
      'POST /api/locations',
      'PUT /api/locations/:id',
      'DELETE /api/locations/:id'
    ]
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📊 健康檢查: http://localhost:${PORT}/health`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
