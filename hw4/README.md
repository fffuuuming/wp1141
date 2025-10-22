# 店家/景點探索平台

一個基於 React + Node.js + Google Maps API 的店家/景點探索與收藏平台。

## 🚀 功能特色

- 🗺️ **地圖探索**：整合 Google Maps API，支援地點搜尋與標記
- 👤 **使用者認證**：註冊、登入、登出功能
- 📍 **地點管理**：新增、編輯、刪除、收藏店家/景點
- ⭐ **評分系統**：為地點添加評分與備註
- 📱 **響應式設計**：支援各種裝置尺寸

## 🏗️ 技術架構

### 前端
- **框架**：React 18 + TypeScript
- **建置工具**：Vite
- **UI 框架**：Material-UI (MUI)
- **路由**：React Router v6
- **HTTP 客戶端**：Axios
- **地圖**：Google Maps JavaScript API

### 後端
- **框架**：Node.js + Express + TypeScript
- **資料庫**：SQLite
- **認證**：JWT + bcrypt
- **Google API**：Geocoding API + Places API

## 📁 專案結構

```
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/      # 可重用組件
│   │   ├── pages/          # 頁面組件
│   │   ├── hooks/          # 自定義 hooks
│   │   ├── services/       # API 服務
│   │   ├── context/        # React Context
│   │   ├── types/          # TypeScript 類型
│   │   └── utils/          # 工具函數
│   └── package.json
├── backend/                 # Node.js 後端
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 資料模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中間件
│   │   ├── services/       # 業務邏輯
│   │   ├── utils/          # 工具函數
│   │   └── types/          # TypeScript 類型
│   └── package.json
├── database/               # SQLite 資料庫檔案
└── README.md
```

## 🚀 快速開始

### 環境需求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Google Maps API Key

### 安裝步驟

1. **複製環境變數檔案**
   ```bash
   cp backend/env.example backend/.env
   ```

2. **設定 Google Maps API Key**
   - 在 [Google Cloud Console](https://console.cloud.google.com/) 建立專案
   - 啟用 Maps JavaScript API、Geocoding API、Places API
   - 將 API Key 填入 `backend/.env` 檔案

3. **安裝依賴**
   ```bash
   # 安裝前端依賴
   cd frontend
   npm install
   
   # 安裝後端依賴
   cd ../backend
   npm install
   ```

4. **啟動開發伺服器**
   ```bash
   # 啟動後端 (終端機 1)
   cd backend
   npm run dev
   
   # 啟動前端 (終端機 2)
   cd frontend
   npm run dev
   ```

5. **開啟瀏覽器**
   - 前端：http://localhost:5173
   - 後端 API：http://localhost:3001

## 📋 API 文件

### 認證相關
- `POST /api/auth/register` - 使用者註冊
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/logout` - 使用者登出
- `GET /api/auth/profile` - 取得使用者資料

### 地點相關
- `GET /api/locations` - 取得使用者的地點清單
- `POST /api/locations` - 新增地點
- `GET /api/locations/:id` - 取得特定地點
- `PUT /api/locations/:id` - 更新地點
- `DELETE /api/locations/:id` - 刪除地點

### Google API 整合
- `POST /api/google/geocode` - 地址轉座標
- `POST /api/google/places` - 搜尋附近地點

## 🔧 開發指令

### 前端
```bash
npm run dev          # 開發模式
npm run build        # 建置生產版本
npm run preview      # 預覽生產版本
npm run lint         # 程式碼檢查
```

### 後端
```bash
npm run dev          # 開發模式 (nodemon)
npm run build        # 編譯 TypeScript
npm run start        # 啟動生產版本
```

## 📝 開發筆記

- 前端使用 Material-UI 提供現代化的 UI 組件
- 後端使用 SQLite 作為輕量級資料庫
- 使用 JWT 進行身份認證
- 整合 Google Maps API 提供地圖功能
- 支援 CORS 跨域請求

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

