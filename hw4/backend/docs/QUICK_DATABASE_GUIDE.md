# 🚀 資料庫管理快速指南

## 三個核心指令

```bash
cd backend

# 1️⃣ 查看資料庫狀態
npm run db:info

# 2️⃣ 清除所有資料（保留結構）
npm run db:clear

# 3️⃣ 重建資料庫（完全重建）
npm run db:rebuild
```

---

## 📝 使用時機

### 🔍 查看資料庫資訊 (`db:info`)
```bash
npm run db:info
```
**使用時機：**
- ✅ 查看有多少使用者和地點
- ✅ 確認資料是否已清除
- ✅ 檢查資料庫是否正常
- ✅ 隨時想了解資料庫狀態

---

### 🗑️ 清除所有資料 (`db:clear`)
```bash
npm run db:clear
```
**使用時機：**
- ✅ 測試完成後想清除測試資料
- ✅ 重新開始測試
- ✅ 快速清空資料但保留結構

**特點：**
- 🚀 快速（< 1 秒）
- 📊 保留資料表結構
- 🔄 重置 ID 從 1 開始

---

### 🔄 重建資料庫 (`db:rebuild`)
```bash
npm run db:rebuild
```
**使用時機：**
- ✅ 修改了資料庫結構
- ✅ 資料庫損壞
- ✅ 需要完全重置

**特點：**
- 💥 完全刪除舊資料庫
- 🆕 建立新資料庫
- 📋 根據最新結構建立表

---

## 🎯 常見情境

### 情境 1：測試後清除資料
```bash
# 測試完成
npm run db:clear
# 資料已清空，可以重新測試
```

### 情境 2：檢查資料狀態
```bash
npm run db:info
# 查看使用者和地點數量
```

### 情境 3：修改資料庫結構
```bash
# 1. 修改 database.ts 或模型檔案
# 2. 重建資料庫
npm run db:rebuild
# 3. 重新啟動服務
npm run dev
```

---

## ⚡ 快速參考

| 需求 | 指令 | 時間 |
|------|------|------|
| 查看狀態 | `npm run db:info` | < 0.5s |
| 清除資料 | `npm run db:clear` | < 0.5s |
| 重建資料庫 | `npm run db:rebuild` | < 1s |

---

## 💡 提示

1. **定期檢查**
   ```bash
   npm run db:info
   ```

2. **測試後清除**
   ```bash
   npm run db:clear
   ```

3. **結構變更後重建**
   ```bash
   npm run db:rebuild
   npm run dev
   ```

---

**更多詳情請參閱：** [完整資料庫管理指南](./DATABASE_MANAGEMENT.md)

