/**
 * 從 API 錯誤回應中提取錯誤訊息
 * 支援處理驗證錯誤的 details 陣列
 */
export function extractErrorMessage(error: any): string {
  // 如果沒有 response，返回通用錯誤
  if (!error.response) {
    return '網路錯誤，請檢查您的網路連線';
  }

  const data = error.response.data;

  // 如果有 details 陣列（驗證錯誤），提取所有錯誤訊息
  if (data.details && Array.isArray(data.details) && data.details.length > 0) {
    // 提取所有錯誤訊息並用換行符連接
    const messages = data.details.map((detail: any) => detail.msg).filter(Boolean);
    
    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  // 如果有 message 欄位，直接返回
  if (data.message) {
    return data.message;
  }

  // 如果有 error 欄位
  if (data.error) {
    return data.error;
  }

  // 根據 HTTP 狀態碼返回通用訊息
  const status = error.response.status;
  switch (status) {
    case 400:
      return '請求格式錯誤';
    case 401:
      return '認證失敗，請重新登入';
    case 403:
      return '沒有權限執行此操作';
    case 404:
      return '找不到請求的資源';
    case 409:
      return '資料衝突';
    case 500:
      return '伺服器錯誤，請稍後再試';
    default:
      return '發生未知錯誤';
  }
}

/**
 * 格式化驗證錯誤為列表形式
 */
export function formatValidationErrors(error: any): string[] {
  if (!error.response?.data?.details) {
    return [];
  }

  const details = error.response.data.details;
  if (!Array.isArray(details)) {
    return [];
  }

  return details.map((detail: any) => detail.msg).filter(Boolean);
}

