# 🔧 Google Maps API 載入問題修復

## 問題描述

遇到以下錯誤：
1. `Uncaught SyntaxError: Cannot use 'import.meta' outside a module`
2. `Google Maps API 尚未載入`

## 原因分析

### 問題 1：`import.meta` 錯誤
- 在 `index.html` 中的普通 `<script>` 標籤無法使用 `import.meta`
- `import.meta` 只能在 ES 模組中使用

### 問題 2：API 載入時機
- React 組件可能在 Google Maps API 完全載入前就開始渲染
- 需要確保 API 完全載入後才初始化地圖

## 解決方案

### 1. 移除 index.html 中的內聯腳本
從 `frontend/index.html` 移除了嘗試載入 Google Maps API 的內聯腳本。

### 2. 創建專用的 API Loader
創建 `frontend/src/utils/googleMapsLoader.ts`：
- ✅ 單例模式確保 API 只載入一次
- ✅ Promise 基礎，支援 async/await
- ✅ 隊列機制處理並發請求
- ✅ 錯誤處理

### 3. 更新 GoogleMap 組件
在地圖初始化前先呼叫 `loadGoogleMapsAPI()`：
```typescript
await loadGoogleMapsAPI();
```

## 修復後的工作流程

```
1. GoogleMap 組件掛載
   ↓
2. 呼叫 loadGoogleMapsAPI()
   ↓
3. 創建並插入 <script> 標籤
   ↓
4. 等待 Google Maps API 載入
   ↓
5. 初始化地圖實例
   ↓
6. 顯示地圖
```

## 驗證修復

### 1. 刷新頁面
```bash
# 確認前端仍在運行
# 訪問 http://localhost:5175
```

### 2. 檢查 Console
應該看到：
- ✅ 沒有 `import.meta` 錯誤
- ✅ 沒有 `Google Maps API 尚未載入` 錯誤
- ✅ 地圖正常顯示

### 3. 測試地點頁面
1. 登入系統
2. 進入地點詳情頁面
3. 應該看到地圖正常載入和顯示

### 4. 測試列表頁面
1. 進入地點列表頁面
2. 應該看到地圖總覽正常顯示
3. 標記正常顯示

## 技術細節

### googleMapsLoader.ts 主要功能

#### 載入狀態管理
```typescript
let isLoading = false;  // 正在載入
let isLoaded = false;   // 已經載入
const callbacks: Array<() => void> = [];  // 回調隊列
```

#### 防止重複載入
```typescript
if (isLoaded) {
  resolve();  // 已載入，直接返回
  return;
}

if (isLoading) {
  callbacks.push(() => resolve());  // 正在載入，加入隊列
  return;
}
```

#### 動態創建 Script
```typescript
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=zh-TW`;
script.async = true;
script.defer = true;
```

## 常見問題

### Q: 如果看到 "Google Maps API Key 未設定" 錯誤？
**A:** 檢查 `frontend/.env` 檔案是否存在並包含：
```env
VITE_GOOGLE_MAPS_JS_KEY=your_api_key_here
```

### Q: 地圖顯示灰色或空白？
**A:** 可能是以下原因：
1. API Key 無效
2. API Key 沒有啟用 Maps JavaScript API
3. API Key 有域名限制

### Q: 地圖載入很慢？
**A:** 這是正常的，Google Maps API 需要時間載入：
- 第一次載入：1-2 秒
- 後續載入：快取，幾乎即時

### Q: 多個地圖組件會重複載入 API 嗎？
**A:** 不會，`googleMapsLoader` 使用單例模式，確保 API 只載入一次。

## 測試清單

- [ ] 頁面刷新後無 Console 錯誤
- [ ] 地點詳情頁面地圖正常顯示
- [ ] 地點列表頁面地圖正常顯示
- [ ] 標記正常顯示
- [ ] 點擊標記正常運作
- [ ] 視圖切換正常運作
- [ ] 載入指示器正常顯示

## 修改的檔案

1. ✅ `frontend/index.html` - 移除內聯腳本
2. ✅ `frontend/src/utils/googleMapsLoader.ts` - 新建 API Loader
3. ✅ `frontend/src/components/GoogleMap.tsx` - 使用 Loader

## 下一步

如果修復成功，請繼續測試：
1. 地點詳情頁面的地圖
2. 地點列表頁面的地圖總覽
3. 視圖模式切換
4. 標記點擊互動
5. 搜尋與地圖聯動

---

**問題應該已經解決！請刷新頁面並重新測試。** 🗺️✨

