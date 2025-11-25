# Line Chatbot System

一個整合 Line Messaging API 的智慧聊天機器人系統，包含 Webhook 式的 AI Bot 後端和管理後台。

## 部署連結

1. LINE Bot URL: https://line.me/R/ti/p/@575slgwx
2. Management Backend Production URL: https://defi-chatbot-tau.vercel.app

**登入說明：**
- 目前管理後台**無需帳密登入**，可直接訪問
- 如需查看對話紀錄，請直接前往管理後台網址

**功能：**
- 📊 對話紀錄檢視與篩選
- 📝 知識庫管理
- 📈 統計資訊查看
- 🔄 即時更新（pooling）

## 🔧 進階功能

### 1. 進階篩選：依日期區間搜尋

管理後台支援依日期區間篩選對話紀錄，方便查看特定時間範圍內的對話。

**功能特點：**
- ✅ 支援開始日期（`startDate`）和結束日期（`endDate`）篩選
- ✅ 可選擇依對話開始時間（`startedAt`）或最後訊息時間（`lastMessageAt`）篩選
- ✅ 日期範圍包含結束日期當天的所有時間（00:00:00 - 23:59:59）
- ✅ 可在管理後台 UI 直接使用日期選擇器

**管理後台使用：**
在管理後台（`/dashboard`）的對話紀錄頁面，可以使用日期選擇器設定開始和結束日期，系統會自動套用篩選條件。

### 2. Webhook 健康檢查：提供可監控的狀態檢查

系統提供多個健康檢查端點，方便監控服務狀態和進行自動化監控。

#### 2.1 系統健康檢查端點

**端點：** `GET /api/health`

**功能：**
- ✅ 檢查資料庫連接狀態和延遲
- ✅ 檢查 LINE API 配置狀態
- ✅ 檢查 LLM API 配置狀態
- ✅ 提供系統運行時間（uptime）
- ✅ 返回整體健康狀態（healthy / degraded / unhealthy）

**回應範例：**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": {
      "status": "connected",
      "latency": 5
    },
    "line": {
      "status": "configured"
    },
    "llm": {
      "status": "configured",
      "provider": "openai"
    }
  },
  "uptime": 3600
}
```

**狀態說明：**
- `healthy`：所有服務正常（HTTP 200）
- `degraded`：部分服務未配置但核心功能可用（HTTP 200）
- `unhealthy`：核心服務（資料庫）無法連接（HTTP 503）

**使用範例：**

```bash
# 檢查系統健康狀態
curl https://defi-chatbot-tau.vercel.app/api/health

# 使用於監控系統（例如：UptimeRobot、Pingdom）
# 設定監控 URL：https://defi-chatbot-tau.vercel.app/api/health
# 預期狀態碼：200（healthy 或 degraded）或 503（unhealthy）
```

#### 2.2 Webhook 專用健康檢查端點

**端點：** `GET /api/webhook`

**功能：**
- ✅ 檢查 LINE Webhook 端點是否正常運作
- ✅ 檢查 LINE API 憑證是否已配置
- ✅ 用於 LINE Developers Console 的 Webhook 驗證
- ✅ 提供 Webhook 服務狀態資訊

**回應範例：**

```json
{
  "success": true,
  "service": "line-webhook",
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "message": "Line webhook endpoint is active",
    "lineConfigured": true,
    "channelSecretConfigured": true,
    "accessTokenConfigured": true
  }
}
```

**狀態說明：**
- `ready`：LINE 憑證已配置，Webhook 可正常運作
- `not_configured`：LINE 憑證未配置，Webhook 無法處理事件

**使用範例：**

```bash
# 檢查 Webhook 健康狀態
curl https://defi-chatbot-tau.vercel.app/api/webhook

# LINE Developers Console 會自動呼叫此端點進行驗證
```

**監控建議：**
- 使用 `GET /api/health` 進行系統整體健康監控
- 使用 `GET /api/webhook` 進行 Webhook 服務專項監控
- 建議監控頻率：每 1-5 分鐘檢查一次
- 建議設定告警：當狀態為 `unhealthy` 或 HTTP 狀態碼為 503 時發送通知

## 📋 Line Bot 對話/功能設計

詳細的對話流程、功能設計、LLM Prompt Template 等資訊，請參考：

**[chatbot-design.md](./chatbot-design.md)**

該文件包含：
- 主題說明
- 功能列表
- 對話腳本（文字、按鈕模板、輪播模板等）
- 對話脈絡維持機制
- LLM Prompt Template 設計
- 回應設計與包裝
- 對話圖結構
- 知識庫設計
- 技術實現細節

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境設定

#### 選項 A: 使用本地 MongoDB（推薦用於開發）

**步驟 1：確保 MongoDB 服務正在運行**

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**步驟 2：創建環境變數文件**

```bash
# 如果沒有 .env.local.example，請創建 .env.local
touch .env.local
```

**步驟 3：編輯 `.env.local` 文件**

```bash
# MongoDB 配置（本地）
MONGODB_URI=mongodb://localhost:27017/line-chatbot

# Line API 配置（從 LINE Developers Console 取得）
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_access_token

# LLM 配置
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key

# 或使用 Anthropic
# LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your_anthropic_api_key

# 應用程式配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 可選配置
LLM_MAX_RETRIES=3
LLM_RETRY_DELAY=1000
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

**詳細說明請查看 [本地 MongoDB 設置指南](./docs/LOCAL_MONGODB_SETUP.md)**

#### 選項 B: 使用 MongoDB Atlas（雲端）

**步驟 1：創建 MongoDB Atlas 帳號**

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 註冊帳號並創建免費叢集（Free Tier）
3. 取得連接字串（Connection String）

**步驟 2：創建環境變數文件**

```bash
touch .env.local
```

**步驟 3：編輯 `.env.local` 文件**

```bash
# MongoDB 配置（Atlas）
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/line-chatbot?retryWrites=true&w=majority

# Line API 配置
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_access_token

# LLM 配置
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key

# 應用程式配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**注意事項：**
- 將 `username` 和 `password` 替換為您的 Atlas 帳號資訊
- 將 `cluster` 替換為您的叢集名稱
- 確保 IP 白名單已設定

### 3. 初始化知識庫

在首次運行前，需要將知識庫資料匯入資料庫：

```bash
npm run seed:knowledge-base
```

此命令會：
- 將 `lib/data/defi-knowledge-base.ts` 中的知識庫資料匯入 MongoDB
- 為每個問題生成向量嵌入（embedding）
- 建立索引以加速搜尋

### 4. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:3000 查看應用

### 6. 設定 LINE Webhook（本地開發）

**使用 ngrok（推薦用於本地測試）：**

```bash
# 安裝 ngrok（如果尚未安裝）
brew install ngrok

# 啟動 ngrok（在另一個終端）
ngrok http 3000

# 複製 ngrok 提供的 URL（例如：https://xxxx.ngrok.io）
# 在 LINE Developers Console 設定 Webhook URL：
# https://xxxx.ngrok.io/api/webhook
```

**或直接部署到 Vercel 進行測試：**

1. 將程式碼推送到 GitHub
2. 在 Vercel 連接 GitHub 倉庫
3. 設定環境變數
4. 部署後使用 Vercel URL 設定 LINE Webhook

詳細說明請查看 [ngrok vs Vercel 指南](./docs/NGROK_VS_VERCEL.md)

## 📁 專案結構

```
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── webhook/        # Line Webhook 端點
│   │   ├── conversations/  # 對話管理 API
│   │   ├── knowledge-base/ # 知識庫 API
│   │   └── health/         # 健康檢查 API
│   ├── dashboard/          # 管理後台
│   │   ├── conversations/  # 對話紀錄頁面
│   │   └── knowledge-base/ # 知識庫管理頁面
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首頁
├── lib/                    # 工具庫
│   ├── config.ts           # 環境變數配置
│   ├── services/           # 服務層
│   │   ├── botLogicService.ts      # Bot 邏輯服務
│   │   ├── messageService.ts        # 訊息處理服務
│   │   ├── ragService.ts            # RAG 服務
│   │   ├── llmService.ts            # LLM 服務
│   │   ├── knowledgeBaseService.ts  # 知識庫服務
│   │   └── conversationFlowService.ts # 對話流程服務
│   ├── models/             # 資料模型
│   ├── repositories/        # 資料庫倉庫
│   └── utils/              # 工具函數
├── types/                  # TypeScript 類型定義
├── scripts/                 # 專案腳本
│   ├── verify-setup.js      # 專案驗證腳本
│   ├── seed-knowledge-base.ts # 知識庫初始化腳本
│   └── test-rag.ts         # RAG 測試腳本
├── docs/                    # 專案文檔
│   ├── IMPLEMENTATION_PLAN.md
│   ├── RAG_IMPLEMENTATION_PLAN.md
│   ├── LOCAL_MONGODB_SETUP.md
│   └── ...
├── chatbot-design.md        # Bot 對話/功能設計文檔
└── README.md                # 本文件
```

## 🛠️ 技術棧

- **框架**: Next.js 14+ (App Router)
- **語言**: TypeScript
- **資料庫**: MongoDB Atlas / 本地 MongoDB + Mongoose
- **樣式**: Tailwind CSS
- **驗證**: Zod
- **API**: Line Messaging API
- **LLM**: OpenAI GPT / Anthropic Claude
- **向量搜尋**: OpenAI Embeddings
- **部署**: Vercel

## 📋 開發命令

```bash
# 開發模式
npm run dev

# 構建生產版本
npm run build

# 啟動生產伺服器
npm start

# 代碼檢查
npm run lint

# TypeScript 類型檢查
npx tsc --noEmit

# 初始化知識庫
npm run seed:knowledge-base

# 測試 RAG 系統
npm run test:rag
```

## 🔧 環境變數說明

### 必需環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `MONGODB_URI` | MongoDB 連接字串 | `mongodb://localhost:27017/line-chatbot` 或 `mongodb+srv://...` |
| `LINE_CHANNEL_SECRET` | LINE Channel Secret | 從 LINE Developers Console 取得 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Channel Access Token | 從 LINE Developers Console 取得 |
| `LLM_PROVIDER` | LLM 提供者 | `openai` 或 `anthropic` |
| `OPENAI_API_KEY` | OpenAI API Key（如果使用 OpenAI） | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API Key（如果使用 Anthropic） | `sk-ant-...` |

### 可選環境變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `NEXT_PUBLIC_APP_URL` | 應用程式公開 URL | `http://localhost:3000` |
| `NODE_ENV` | 環境模式 | `development` |
| `LLM_MAX_RETRIES` | LLM 最大重試次數 | `3` |
| `LLM_RETRY_DELAY` | LLM 重試延遲（毫秒） | `1000` |
| `OPENAI_EMBEDDING_MODEL` | OpenAI Embedding 模型 | `text-embedding-3-small` |
| `EMBEDDING_DIMENSIONS` | Embedding 維度 | `1536` |

運行 `node scripts/verify-setup.js` 進行完整驗證。

## 🔒 安全注意事項

- ⚠️ **不要將 `.env.local` 文件提交到版本控制**
- ⚠️ **確保所有敏感資訊都通過環境變數管理**
- ⚠️ **在生產環境中使用安全的密鑰管理方案**
- ⚠️ **定期更新依賴包以修復安全漏洞**
- ⚠️ **限制 MongoDB Atlas IP 白名單（生產環境）**

## 🐛 常見問題

### 1. MongoDB 連接失敗

**問題：** 無法連接到 MongoDB

**解決方案：**
- 檢查 MongoDB 服務是否運行：`brew services list | grep mongodb`
- 檢查連接字串是否正確
- 如果使用 Atlas，檢查 IP 白名單設定

### 2. LINE Webhook 驗證失敗

**問題：** LINE Webhook 無法驗證

**解決方案：**
- 檢查 `LINE_CHANNEL_SECRET` 是否正確
- 確認 Webhook URL 可以公開訪問
- 檢查 Vercel 環境變數是否正確設定

### 3. LLM API 錯誤

**問題：** LLM API 呼叫失敗

**解決方案：**
- 檢查 API Key 是否正確
- 檢查 API 配額是否用完
- 查看日誌了解詳細錯誤訊息

### 4. 知識庫搜尋無結果

**問題：** RAG 系統無法找到相關知識

**解決方案：**
- 確認已執行 `npm run seed:knowledge-base`
- 檢查知識庫資料是否正確匯入
- 檢查向量嵌入是否正確生成

## 📚 相關文檔

- [Next.js 文檔](https://nextjs.org/docs)
- [Line Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [Mongoose 文檔](https://mongoosejs.com/docs/)
- [Zod 文檔](https://zod.dev/)
- [OpenAI API 文檔](https://platform.openai.com/docs)
- [Vercel 部署文檔](https://vercel.com/docs)

## 📄 授權

本專案為課程作業專案。
