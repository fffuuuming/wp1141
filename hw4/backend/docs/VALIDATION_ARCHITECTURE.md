# 驗證架構設計文件

## 📋 概述

本專案採用**三層驗證架構**，清晰劃分職責，避免重複驗證邏輯。

---

## 🏗️ 三層驗證架構

```
┌─────────────────────────────────────────────────────────────┐
│                        使用者請求                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  第一層：前端驗證 (frontend/src/utils/formValidation.ts)    │
│  職責：即時反饋，提升使用者體驗                              │
│  時機：使用者輸入時 (onBlur)                                 │
│  範圍：格式驗證（長度、格式、類型）                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  第二層：後端格式驗證 (backend/src/middleware/validation.ts)│
│  職責：確保請求資料格式正確                                  │
│  時機：請求到達 Controller 之前 (Express Middleware)         │
│  範圍：格式驗證（長度、格式、類型、必填）                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  第三層：業務邏輯驗證 (backend/src/controllers/*.ts)        │
│  職責：驗證業務規則                                          │
│  時機：Controller 處理請求時                                 │
│  範圍：業務邏輯（帳號是否存在、密碼是否正確、權限檢查）      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                          資料庫操作
```

---

## 📝 各層職責詳細說明

### **第一層：前端驗證 (Frontend Validation)**

**檔案位置：** `frontend/src/utils/formValidation.ts`

**職責：**
- 提供即時反饋，提升使用者體驗
- 減少不必要的後端請求
- 與後端格式驗證規則**完全一致**

**驗證時機：**
- `onBlur` 事件：使用者離開欄位時
- 表單提交前（可選）

**驗證範圍：**
- ✅ 欄位格式（Email、URL 等）
- ✅ 長度限制（最小/最大長度）
- ✅ 特殊字元限制
- ✅ 密碼強度（長度、大小寫、數字、特殊字元）
- ❌ **不驗證**業務邏輯（帳號是否存在、密碼是否正確）

**範例驗證函數：**
- `validateUsername(username: string)`
- `validateEmail(email: string)`
- `validatePassword(password: string, isRegister: boolean)`
- `validateConfirmPassword(password: string, confirmPassword: string)`

**回傳格式：**
```typescript
{
  isValid: boolean;
  error?: string;
}
```

---

### **第二層：後端格式驗證 (Backend Format Validation)**

**檔案位置：** `backend/src/middleware/validation.ts`

**職責：**
- 確保所有到達 Controller 的請求都有正確的格式
- 作為安全防線（即使前端驗證被繞過）
- 統一錯誤格式，方便前端處理

**驗證時機：**
- Express 中間件，在 Controller 之前執行
- 使用 `express-validator` 進行驗證

**驗證範圍：**
- ✅ 欄位格式（Email、URL 等）
- ✅ 長度限制（最小/最大長度）
- ✅ 特殊字元限制
- ✅ 資料類型（String、Number、Boolean）
- ✅ 必填/選填欄位
- ✅ 密碼強度（長度、大小寫、數字、特殊字元）
- ❌ **不驗證**業務邏輯（帳號是否存在、密碼是否正確）

**驗證函數：**
- `validateRegister` - 註冊驗證
- `validateLogin` - 登入驗證
- `validateLocation` - 地點驗證

**錯誤回傳格式：**
```json
{
  "error": "Validation Error",
  "message": "輸入資料驗證失敗",
  "details": [
    {
      "type": "field",
      "value": "ab",
      "msg": "使用者名稱長度必須在 3-50 個字元之間",
      "path": "username",
      "location": "body"
    }
  ],
  "timestamp": "2025-10-24T..."
}
```

**關鍵特點：**
- 使用 `handleValidationErrors` 統一處理錯誤
- 提供 `details` 陣列，包含所有驗證錯誤
- 前端可以解析 `details` 並顯示在對應欄位下方

---

### **第三層：業務邏輯驗證 (Business Logic Validation)**

**檔案位置：** `backend/src/controllers/*.ts`

**職責：**
- 驗證業務規則
- 檢查資料庫狀態
- 權限檢查

**驗證時機：**
- Controller 處理請求時
- 在通過格式驗證之後

**驗證範圍：**
- ✅ 帳號是否已存在
- ✅ 密碼是否正確
- ✅ 使用者是否有權限
- ✅ 資源是否存在（如地點、列表）
- ✅ 關聯資料是否合法
- ❌ **不驗證**格式（已由中間件驗證）

**範例驗證：**

#### **註冊時的業務邏輯驗證：**
```typescript
// 檢查 email 是否已存在
const emailExists = await UserModel.emailExists(email);
if (emailExists) {
  return res.status(409).json({
    error: 'Conflict',
    message: '此電子郵件地址已被使用',
    timestamp: new Date().toISOString()
  });
}

// 檢查使用者名稱是否已存在
const usernameExists = await UserModel.usernameExists(username);
if (usernameExists) {
  return res.status(409).json({
    error: 'Conflict',
    message: '此使用者名稱已被使用',
    timestamp: new Date().toISOString()
  });
}
```

#### **登入時的業務邏輯驗證：**
```typescript
// 檢查使用者是否存在
const user = await UserModel.findByEmail(email);
if (!user) {
  return res.status(401).json({
    error: 'Unauthorized',
    message: '無效的電子郵件或密碼',
    timestamp: new Date().toISOString()
  });
}

// 驗證密碼
const isPasswordValid = await verifyPassword(password, user.password);
if (!isPasswordValid) {
  return res.status(401).json({
    error: 'Unauthorized',
    message: '無效的電子郵件或密碼',
    timestamp: new Date().toISOString()
  });
}
```

**錯誤回傳格式：**
```json
{
  "error": "Conflict",
  "message": "此電子郵件地址已被使用",
  "timestamp": "2025-10-24T..."
}
```

**關鍵特點：**
- 沒有 `details` 陣列（不是格式錯誤）
- 前端會將錯誤顯示在頂部 Alert
- 出於安全考慮，某些錯誤會模糊化（如「無效的電子郵件或密碼」）

---

## 🔄 驗證流程圖

### **註冊流程**

```
使用者輸入 → 前端即時驗證 → 點擊註冊按鈕
                ↓
        請求發送到後端
                ↓
     Express Middleware (validation.ts)
                ↓
        ┌─────────────────┐
        │ validateRegister │
        └─────────────────┘
                ↓
        格式驗證通過？
        ├─ 否 → 回傳 400 + details[] → 前端顯示在欄位下方
        ↓
        是 → 進入 Controller (authController.ts)
                ↓
        Email 已存在？
        ├─ 是 → 回傳 409 "Email 已被使用" → 前端顯示在頂部
        ↓
        否 → 使用者名稱已存在？
        ├─ 是 → 回傳 409 "使用者名稱已被使用" → 前端顯示在頂部
        ↓
        否 → 建立帳號 → 回傳 201 + token
```

### **登入流程**

```
使用者輸入 → 前端即時驗證 → 點擊登入按鈕
                ↓
        請求發送到後端
                ↓
     Express Middleware (validation.ts)
                ↓
        ┌──────────────┐
        │ validateLogin │
        └──────────────┘
                ↓
        格式驗證通過？
        ├─ 否 → 回傳 400 + details[] → 前端顯示在欄位下方
        ↓
        是 → 進入 Controller (authController.ts)
                ↓
        使用者存在？
        ├─ 否 → 回傳 401 "無效的電子郵件或密碼" → 前端顯示在頂部
        ↓
        是 → 密碼正確？
        ├─ 否 → 回傳 401 "無效的電子郵件或密碼" → 前端顯示在頂部
        ↓
        是 → 回傳 200 + token
```

---

## 📚 密碼驗證重構說明

### **重構前的問題：**

❌ **三處重複驗證：**
1. `validation.ts` - `validateRegister` 中間件
2. `password.ts` - `validatePasswordStrength` 函數
3. `authController.ts` - 手動調用 `validatePasswordStrength`

❌ **驗證規則不一致：**
- 中間件使用複雜的 regex：`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/`
- `validatePasswordStrength` 使用分別的 regex

❌ **錯誤訊息不一致：**
- 中間件：一條錯誤訊息包含所有要求
- `validatePasswordStrength`：分別的錯誤訊息

### **重構後的解決方案：**

✅ **統一在 `validation.ts` 驗證：**
```typescript
body('password')
  .isLength({ min: 8 })
  .withMessage('密碼長度至少需要 8 個字元')
  .matches(/[A-Z]/)
  .withMessage('密碼必須包含至少一個大寫字母')
  .matches(/[a-z]/)
  .withMessage('密碼必須包含至少一個小寫字母')
  .matches(/\d/)
  .withMessage('密碼必須包含至少一個數字')
  .matches(/[@$!%*?&]/)
  .withMessage('密碼必須包含至少一個特殊字元 (@$!%*?&)')
```

✅ **`password.ts` 只負責密碼雜湊和驗證：**
```typescript
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean>
```

✅ **`authController.ts` 移除重複驗證：**
- 移除 `validatePasswordStrength` 的調用
- 只保留業務邏輯驗證（Email/使用者名稱是否已存在）

### **重構優勢：**

1. **職責清晰**：
   - `validation.ts` 負責格式
   - `password.ts` 負責密碼加密
   - `authController.ts` 負責業務邏輯

2. **避免重複**：
   - 密碼格式只在一個地方定義
   - 修改規則時只需改一處

3. **錯誤訊息統一**：
   - 所有格式錯誤都通過 `details[]` 回傳
   - 前端可以統一處理

4. **性能提升**：
   - 避免在 Controller 中重複驗證
   - 格式錯誤在中間件層就被攔截

---

## 🎯 前端錯誤顯示邏輯

### **判斷錯誤類型：**

```typescript
// 在 handleSubmit 中
catch (err: any) {
  const data = err.response?.data;
  
  // 檢查是否為格式驗證錯誤（有 details 陣列）
  if (data?.details && Array.isArray(data.details)) {
    // 將驗證錯誤顯示在對應的欄位下方
    const errors: { [key: string]: string } = {};
    data.details.forEach((detail: any) => {
      if (detail.path) {
        errors[detail.path] = detail.msg;
      }
    });
    setFieldErrors(errors);
  } else {
    // 業務邏輯錯誤顯示在頂部
    setError(extractErrorMessage(err));
  }
}
```

### **顯示位置：**

| 錯誤類型 | 判斷依據 | 顯示位置 |
|---------|---------|---------|
| 格式驗證錯誤 | 有 `details` 陣列 | 欄位下方（紅色 helperText） |
| 業務邏輯錯誤 | 沒有 `details` 陣列 | 頂部（紅色 Alert） |

---

## ✅ 驗證規則一致性檢查表

### **使用者名稱驗證：**

| 規則 | 前端 | 後端中間件 | 一致性 |
|-----|-----|----------|--------|
| 長度 3-50 字元 | ✅ | ✅ | ✅ |
| 只能包含字母、數字、底線 | ✅ | ✅ | ✅ |
| 不能為空 | ✅ | ✅ | ✅ |

### **電子郵件驗證：**

| 規則 | 前端 | 後端中間件 | 一致性 |
|-----|-----|----------|--------|
| 必須是有效格式 | ✅ | ✅ | ✅ |
| 不能為空 | ✅ | ✅ | ✅ |

### **密碼驗證（註冊）：**

| 規則 | 前端 | 後端中間件 | 一致性 |
|-----|-----|----------|--------|
| 長度至少 8 字元 | ✅ | ✅ | ✅ |
| 包含大寫字母 | ✅ | ✅ | ✅ |
| 包含小寫字母 | ✅ | ✅ | ✅ |
| 包含數字 | ✅ | ✅ | ✅ |
| 包含特殊字元 (@$!%*?&) | ✅ | ✅ | ✅ |
| 不能為空 | ✅ | ✅ | ✅ |

### **密碼驗證（登入）：**

| 規則 | 前端 | 後端中間件 | 一致性 |
|-----|-----|----------|--------|
| 不能為空 | ✅ | ✅ | ✅ |

---

## 📖 最佳實踐

### **1. 新增驗證規則時：**

1. 在 `validation.ts` 加入格式驗證規則
2. 在 `formValidation.ts` 加入相同的規則
3. 確保錯誤訊息一致
4. 在 Controller 加入業務邏輯驗證（如需要）

### **2. 修改驗證規則時：**

1. 同時修改前端和後端的格式驗證
2. 保持錯誤訊息一致
3. 測試前端和後端的驗證行為

### **3. 錯誤訊息設計原則：**

- **格式錯誤**：具體明確（如「密碼長度至少需要 8 個字元」）
- **業務邏輯錯誤**：適度模糊（如「無效的電子郵件或密碼」而非「帳號不存在」）
- **安全考慮**：不要透露過多系統資訊

### **4. 驗證順序：**

1. **前端即時驗證**（onBlur）
2. **後端格式驗證**（Middleware）
3. **業務邏輯驗證**（Controller）

---

## 🚀 總結

### **清晰的職責劃分：**

- ✅ **前端驗證**：即時反饋，提升 UX
- ✅ **後端格式驗證**：安全防線，統一錯誤格式
- ✅ **業務邏輯驗證**：確保資料合法性

### **避免的問題：**

- ❌ 重複驗證邏輯
- ❌ 驗證規則不一致
- ❌ 職責不清晰
- ❌ 效能浪費

### **帶來的好處：**

- ✅ 程式碼易維護
- ✅ 驗證邏輯統一
- ✅ 錯誤訊息清晰
- ✅ 使用者體驗優秀

---

**本文件最後更新：2025-10-24**

