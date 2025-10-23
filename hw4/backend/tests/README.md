# 🧪 測試目錄結構

## 📁 目錄說明

```
tests/
├── unit/                    # 單元測試（未來擴展）
├── integration/             # 整合測試
│   ├── test-database.ts     # 資料庫功能測試
│   ├── test-auth.ts         # 認證系統測試
│   ├── test-google-api.ts   # Google API 測試
│   ├── test-location-crud.ts # 地點 CRUD 測試
│   ├── test-refactor.ts     # 重構功能測試
│   └── *.http              # HTTP 測試檔案
├── e2e/                     # 端到端測試（未來擴展）
├── test-config.ts          # 測試配置
├── test-helpers.ts         # 測試工具函數
└── run-tests.ts           # 統一測試執行器

scripts/
├── cleanup/                # 清理腳本
│   ├── clear-test-data.ts  # 清理測試資料
│   └── reset-database.ts   # 重置資料庫
└── setup/                 # 設置腳本
    ├── prepare-test-env.ts # 準備測試環境
    └── run-all-tests.ts   # 執行所有測試

docs/
└── CLEANUP_GUIDE.md       # 清理指南
```

## 🚀 使用方法

### **統一測試命令**

```bash
# 執行所有測試
npm run test:all

# 執行單一測試
npm run test:single db      # 資料庫測試
npm run test:single auth    # 認證測試
npm run test:single google  # Google API 測試
npm run test:single location # 地點 CRUD 測試
npm run test:single refactor # 重構測試

# 環境管理
npm run test:cleanup        # 清理測試環境
npm run test:prepare        # 準備測試環境

# 顯示幫助
npm run test:help
```

### **傳統命令（向後相容）**

```bash
# 個別測試
npm run test-db
npm run test-auth
npm run test-google
npm run test-location
npm run test-refactor

# 環境管理
npm run clear-data
npm run reset-db
npm run prepare-test
npm run fresh-start
```

## 🔧 測試工具

### **ApiTestHelper**
```typescript
import { ApiTestHelper } from './test-helpers';

const api = new ApiTestHelper();

// 登入
await api.login('test@example.com', 'Password123!');

// 建立地點
await api.createLocation({
  name: '測試地點',
  address: '台北101'
});

// 取得地點清單
const response = await api.getLocations();
```

### **TestAssertions**
```typescript
import { TestAssertions } from './test-helpers';

// 檢查成功回應
TestAssertions.assertSuccess(response, '操作成功');

// 檢查錯誤回應
TestAssertions.assertError(response, 400, 'Bad Request');

// 檢查資料數量
TestAssertions.assertDataCount(response, 5, 'data');
```

### **TestRunner**
```typescript
import { TestRunner } from './test-helpers';

const runner = new TestRunner();

runner.addTest('測試 1', async () => {
  // 測試邏輯
});

runner.addTest('測試 2', async () => {
  // 測試邏輯
});

await runner.runAll();
```

## 📊 測試配置

### **test-config.ts**
包含所有測試相關的配置：
- 測試資料庫路徑
- API 基礎 URL
- 測試使用者帳號
- 測試地點資料
- Google API 測試資料

### **測試工具函數**
- `randomString()` - 生成隨機字串
- `randomEmail()` - 生成隨機 email
- `sleep()` - 等待指定時間
- `generateTestToken()` - 生成測試 token

## 🎯 最佳實踐

1. **測試隔離**：每個測試都應該獨立運行
2. **資料清理**：測試前後都要清理測試資料
3. **錯誤處理**：測試應該包含成功和失敗的情況
4. **斷言明確**：使用明確的斷言檢查結果
5. **日誌記錄**：測試過程要有清楚的日誌輸出

## 🔍 故障排除

### **測試失敗**
1. 檢查伺服器是否運行
2. 檢查資料庫是否正常
3. 檢查環境變數是否設定
4. 執行 `npm run test:cleanup` 清理環境

### **權限問題**
```bash
# 檢查檔案權限
ls -la tests/
ls -la scripts/

# 修改權限（如果需要）
chmod +x tests/run-tests.ts
```

### **依賴問題**
```bash
# 重新安裝依賴
npm install

# 檢查 TypeScript 編譯
npx tsc --noEmit
```

## 📈 擴展指南

### **添加新測試**
1. 在 `tests/integration/` 建立新的測試檔案
2. 使用 `ApiTestHelper` 和 `TestAssertions`
3. 在 `run-tests.ts` 中添加測試到執行順序
4. 更新 `package.json` 腳本

### **添加單元測試**
1. 在 `tests/unit/` 建立單元測試檔案
2. 使用 Jest 或其他測試框架
3. 測試個別函數和類別

### **添加 E2E 測試**
1. 在 `tests/e2e/` 建立端到端測試檔案
2. 使用 Playwright 或 Cypress
3. 測試完整的用戶流程
