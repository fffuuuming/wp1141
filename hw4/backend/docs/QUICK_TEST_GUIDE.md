# 🚀 快速測試指南

## ⚡ 一鍵測試

```bash
# 在 backend 目錄下執行
npm run test-frontend
```

這個命令會自動測試：
- ✅ 後端健康檢查
- ✅ 前端運行狀態
- ✅ 使用者註冊
- ✅ 使用者登入
- ✅ 獲取使用者資料
- ✅ 認證保護

---

## 🧹 快速清除資料

### **清除前端測試使用者**
```bash
npm run clear-frontend-users
```
只清除在前端手動註冊的測試使用者，不影響其他資料。

### **清除所有測試資料**
```bash
npm run clear-data
```
清除所有測試地點和測試使用者。

### **完整重置**
```bash
npm run fresh-start
```
刪除整個資料庫並重新建立，包含標準測試資料。

---

## 🎯 常用測試工作流程

### **工作流程 1：快速驗證**
```bash
# 1. 執行自動化測試
npm run test-frontend

# 2. 如果需要，清除測試使用者
npm run clear-frontend-users
```

### **工作流程 2：完整測試**
```bash
# 1. 完整重置環境
npm run fresh-start

# 2. 啟動後端
npm run dev

# 3. 在另一個終端啟動前端
cd ../frontend && npm run dev

# 4. 手動測試或執行自動化測試
npm run test-frontend

# 5. 測試完成後清除
npm run clear-data
```

### **工作流程 3：開發新功能**
```bash
# 1. 清除測試使用者，保留其他資料
npm run clear-frontend-users

# 2. 開始開發...

# 3. 測試新功能

# 4. 如需完全重置
npm run fresh-start
```

---

## 📖 詳細指南

查看完整的手動測試指南：
- [手動測試指南](./MANUAL_TESTING_GUIDE.md)
- [資料清理指南](./CLEANUP_GUIDE.md)

---

## 🔑 測試帳號

### **自動化測試使用的帳號**
- Email: `frontendtest@example.com`
- Password: `Test123456!`

### **標準測試帳號**
```bash
# 使用 npm run fresh-start 後可用
Email: test@example.com
Password: Password123!
```

---

## 💡 小技巧

1. **使用無痕模式測試**：避免快取和 cookie 干擾
2. **使用開發者工具**：F12 查看 Network 和 Console
3. **檢查 Local Storage**：確認 token 是否正確儲存
4. **定期清理**：測試前執行 `npm run clear-frontend-users`

---

## 🐛 遇到問題？

1. 檢查服務是否運行：
   ```bash
   # 檢查後端
   curl http://localhost:3001/health
   
   # 檢查前端
   curl http://localhost:5173
   ```

2. 查看服務日誌：
   - 後端日誌在終端機中
   - 前端錯誤在瀏覽器 Console 中

3. 完全重置：
   ```bash
   npm run fresh-start
   ```

測試愉快！🎉
