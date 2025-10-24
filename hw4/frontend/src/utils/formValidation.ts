/**
 * 前端表單驗證工具
 * 提供即時欄位驗證，與後端驗證規則保持一致
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 驗證使用者名稱
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      error: '使用者名稱不能為空',
    };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: '使用者名稱長度必須在 3-50 個字元之間',
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: '使用者名稱長度必須在 3-50 個字元之間',
    };
  }

  // 檢查格式：只能包含字母、數字和底線
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: '使用者名稱只能包含字母、數字和底線',
    };
  }

  return { isValid: true };
}

/**
 * 驗證電子郵件
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: '電子郵件不能為空',
    };
  }

  // 簡單的 email 格式驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: '請提供有效的電子郵件地址',
    };
  }

  return { isValid: true };
}

/**
 * 驗證密碼（註冊用）
 */
export function validatePassword(password: string, isRegister: boolean = false): ValidationResult {
  if (!password || password.length === 0) {
    return {
      isValid: false,
      error: '密碼不能為空',
    };
  }

  // 註冊時需要更嚴格的驗證
  if (isRegister) {
    if (password.length < 8) {
      return {
        isValid: false,
        error: '密碼長度至少需要 8 個字元',
      };
    }

    // 檢查是否包含大寫字母
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: '密碼必須包含至少一個大寫字母',
      };
    }

    // 檢查是否包含小寫字母
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: '密碼必須包含至少一個小寫字母',
      };
    }

    // 檢查是否包含數字
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        error: '密碼必須包含至少一個數字',
      };
    }

    // 檢查是否包含特殊字元
    if (!/[@$!%*?&]/.test(password)) {
      return {
        isValid: false,
        error: '密碼必須包含至少一個特殊字元 (@$!%*?&)',
      };
    }
  }

  return { isValid: true };
}

/**
 * 驗證確認密碼
 */
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword || confirmPassword.length === 0) {
    return {
      isValid: false,
      error: '請確認密碼',
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: '密碼確認不一致',
    };
  }

  return { isValid: true };
}

