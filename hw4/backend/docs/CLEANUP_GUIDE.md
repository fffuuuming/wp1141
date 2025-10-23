# 🧹 資料清理與測試環境管理指南

## 📋 可用的清理命令

### 🔄 **完整重置（推薦用於新功能開發）**
```bash
npm run fresh-start
```
- 刪除整個資料庫檔案
- 重新建立資料庫結構
- 建立標準測試資料
- **用途**：新功能開發、重大重構

### 🧹 **清理測試資料（保留資料庫結構）**
```bash
npm run clear-data
```
- 清理所有測試地點
- 清理測試使用者（保留管理員）
- 重置資料庫序列
- **用途**：日常測試、小功能測試

### 🏗️ **重新建立資料庫**
```bash
npm run reset-db
```
- 刪除資料庫檔案
- 重新建立資料庫結構
- **用途**：資料庫結構變更

### 🧪 **準備測試環境**
```bash
npm run prepare-test
```
- 建立標準測試使用者
- 建立標準測試地點
- **用途**：手動測試準備

## 🎯 **使用場景**

### **場景 1：開發新功能**
```bash
# 1. 完整重置環境
npm run fresh-start

# 2. 啟動伺服器
npm run dev

# 3. 開發新功能...

# 4. 測試新功能
npm run test-all
```

### **場景 2：重構後測試**
```bash
# 1. 清理舊測試資料
npm run clear-data

# 2. 啟動伺服器
npm run dev

# 3. 執行重構測試
npm run test-refactor
```

### **場景 3：手動測試**
```bash
# 1. 準備測試環境
npm run prepare-test

# 2. 啟動伺服器
npm run dev

# 3. 使用測試帳號手動測試
# Email: test@example.com
# Password: Password123!
```

### **場景 4：完整測試流程**
```bash
# 執行所有測試（包含清理和準備）
npm run test-all
```

## 🔑 **測試帳號**

### **標準測試帳號**
- **Email**: `test@example.com`
- **Password**: `Password123!`
- **用途**: 一般功能測試

### **管理員帳號**
- **Email**: `admin@example.com`
- **Password**: `Admin123!`
- **用途**: 管理功能測試

## 📊 **測試資料**

### **標準測試地點**
1. **測試咖啡廳**
   - 地址: 台北市信義區信義路五段7號
   - 分類: 咖啡廳
   - 評分: 4

2. **測試餐廳**
   - 地址: 台北市大安區敦化南路一段236號
   - 分類: 餐廳
   - 評分: 5

## 🚨 **注意事項**

### **資料清理範圍**
- ✅ 清理測試使用者（email 包含 test、refactor、manual）
- ✅ 清理所有測試地點
- ✅ 重置資料庫序列
- ❌ 不會清理生產資料（如果有的話）

### **安全提醒**
- 所有清理操作都是**不可逆**的
- 確保在測試環境中執行
- 不要在有重要資料的環境中執行 `reset-db`

## 🔧 **故障排除**

### **問題 1：資料庫鎖定**
```bash
# 停止伺服器
pkill -f "nodemon"

# 等待 2 秒
sleep 2

# 執行清理
npm run clear-data
```

### **問題 2：權限錯誤**
```bash
# 檢查資料庫檔案權限
ls -la database/

# 修改權限（如果需要）
chmod 664 database/locations.db
```

### **問題 3：測試失敗**
```bash
# 完整重置
npm run fresh-start

# 重新測試
npm run test-all
```

## 📈 **最佳實踐**

1. **開發新功能前**：執行 `npm run fresh-start`
2. **重構後**：執行 `npm run test-refactor`
3. **每日測試**：執行 `npm run clear-data` 然後手動測試
4. **發布前**：執行 `npm run test-all`

## 🎉 **快速開始**

```bash
# 一鍵設置乾淨的測試環境
npm run fresh-start && npm run dev
```

現在您可以在 `http://localhost:3001` 使用測試帳號進行測試！
