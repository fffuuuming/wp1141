import express from 'express';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: 'Express 伺服器測試',
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
});

export default app;
