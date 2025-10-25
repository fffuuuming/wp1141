import { Request, Response, NextFunction } from 'express';

// Google Maps API 配額管理
interface ApiQuotaInfo {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  lastResetDate: string;
  requestsPerMinute: number;
  lastRequestTime: number;
}

// 記憶體中的配額追蹤（生產環境應使用 Redis）
const quotaTracker: Map<string, ApiQuotaInfo> = new Map();

// Google Maps API 配額限制
const GOOGLE_API_QUOTAS = {
  // 免費配額限制
  FREE_TIER: {
    dailyLimit: 1000, // 每日 1000 次請求
    requestsPerMinute: 10, // 每分鐘 10 次請求
    geocodingDailyLimit: 100, // 地理編碼每日 100 次
    placesDailyLimit: 100, // Places API 每日 100 次
    directionsDailyLimit: 100 // Directions API 每日 100 次
  },
  // 付費配額限制（假設）
  PAID_TIER: {
    dailyLimit: 100000, // 每日 100,000 次請求
    requestsPerMinute: 100, // 每分鐘 100 次請求
    geocodingDailyLimit: 10000,
    placesDailyLimit: 10000,
    directionsDailyLimit: 10000
  }
};

// 獲取當前配額限制
function getCurrentQuotaLimits() {
  // 這裡可以根據環境變數或配置決定使用哪個配額等級
  const isPaidTier = process.env.GOOGLE_MAPS_PAID_TIER === 'true';
  return isPaidTier ? GOOGLE_API_QUOTAS.PAID_TIER : GOOGLE_API_QUOTAS.FREE_TIER;
}

// 獲取或初始化配額資訊
function getQuotaInfo(apiType: string): ApiQuotaInfo {
  const today = new Date().toDateString();
  const key = `${apiType}_${today}`;
  
  if (!quotaTracker.has(key)) {
    const limits = getCurrentQuotaLimits();
    quotaTracker.set(key, {
      dailyLimit: limits[`${apiType}DailyLimit` as keyof typeof limits] || limits.dailyLimit,
      usedToday: 0,
      remainingToday: limits[`${apiType}DailyLimit` as keyof typeof limits] || limits.dailyLimit,
      lastResetDate: today,
      requestsPerMinute: limits.requestsPerMinute,
      lastRequestTime: 0
    });
  }
  
  return quotaTracker.get(key)!;
}

// 檢查配額是否足夠
function checkQuota(apiType: string): { allowed: boolean; reason?: string; retryAfter?: number } {
  const quotaInfo = getQuotaInfo(apiType);
  const now = Date.now();
  
  // 檢查每日配額
  if (quotaInfo.usedToday >= quotaInfo.dailyLimit) {
    return {
      allowed: false,
      reason: `每日 ${apiType} API 配額已用完`,
      retryAfter: 24 * 60 * 60 * 1000 // 24 小時後重試
    };
  }
  
  // 檢查每分鐘配額
  const timeSinceLastRequest = now - quotaInfo.lastRequestTime;
  if (timeSinceLastRequest < 60000) { // 1 分鐘內
    const requestsInLastMinute = Math.floor(timeSinceLastRequest / 6000); // 假設每 6 秒一次請求
    if (requestsInLastMinute >= quotaInfo.requestsPerMinute) {
      return {
        allowed: false,
        reason: `每分鐘 ${apiType} API 請求過於頻繁`,
        retryAfter: 60000 - timeSinceLastRequest
      };
    }
  }
  
  return { allowed: true };
}

// 記錄 API 請求
function recordApiRequest(apiType: string): void {
  const quotaInfo = getQuotaInfo(apiType);
  quotaInfo.usedToday++;
  quotaInfo.remainingToday--;
  quotaInfo.lastRequestTime = Date.now();
}

// Google Maps API 配額檢查中間件
export function googleApiQuotaCheck(apiType: 'geocoding' | 'places' | 'directions' | 'general') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const quotaCheck = checkQuota(apiType);
    
    if (!quotaCheck.allowed) {
      res.status(429).json({
        success: false,
        message: quotaCheck.reason,
        error: 'QUOTA_EXCEEDED',
        retryAfter: quotaCheck.retryAfter ? Math.round(quotaCheck.retryAfter / 1000) : undefined,
        quotaInfo: {
          apiType,
          dailyLimit: getQuotaInfo(apiType).dailyLimit,
          usedToday: getQuotaInfo(apiType).usedToday,
          remainingToday: getQuotaInfo(apiType).remainingToday
        }
      });
      return;
    }
    
    // 記錄請求
    recordApiRequest(apiType);
    
    // 添加配額資訊到 response headers
    const quotaInfo = getQuotaInfo(apiType);
    res.set({
      'X-Quota-Remaining': quotaInfo.remainingToday.toString(),
      'X-Quota-Used': quotaInfo.usedToday.toString(),
      'X-Quota-Limit': quotaInfo.dailyLimit.toString(),
      'X-Quota-Reset': new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    
    next();
  };
}

// 配額狀態查詢端點
export function getQuotaStatus(req: Request, res: Response): void {
  const apiTypes = ['geocoding', 'places', 'directions', 'general'];
  const quotaStatus: Record<string, any> = {};
  
  apiTypes.forEach(apiType => {
    const quotaInfo = getQuotaInfo(apiType);
    quotaStatus[apiType] = {
      dailyLimit: quotaInfo.dailyLimit,
      usedToday: quotaInfo.usedToday,
      remainingToday: quotaInfo.remainingToday,
      usagePercentage: Math.round((quotaInfo.usedToday / quotaInfo.dailyLimit) * 100),
      lastResetDate: quotaInfo.lastResetDate,
      requestsPerMinute: quotaInfo.requestsPerMinute
    };
  });
  
  res.json({
    success: true,
    message: '配額狀態查詢成功',
    data: {
      quotaStatus,
      currentTier: process.env.GOOGLE_MAPS_PAID_TIER === 'true' ? 'PAID' : 'FREE',
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
}

// 配額警告檢查
export function checkQuotaWarnings(): void {
  const apiTypes = ['geocoding', 'places', 'directions', 'general'];
  
  apiTypes.forEach(apiType => {
    const quotaInfo = getQuotaInfo(apiType);
    const usagePercentage = (quotaInfo.usedToday / quotaInfo.dailyLimit) * 100;
    
    if (usagePercentage >= 90) {
      console.warn(`⚠️ ${apiType} API 配額使用率已達 ${usagePercentage.toFixed(1)}%`);
    } else if (usagePercentage >= 75) {
      console.warn(`⚠️ ${apiType} API 配額使用率已達 ${usagePercentage.toFixed(1)}%`);
    }
  });
}

// 定期清理過期的配額記錄
export function cleanupQuotaRecords(): void {
  const today = new Date().toDateString();
  
  for (const [key, quotaInfo] of quotaTracker.entries()) {
    if (quotaInfo.lastResetDate !== today) {
      quotaTracker.delete(key);
    }
  }
}

// 每小時檢查配額警告
setInterval(checkQuotaWarnings, 60 * 60 * 1000);

// 每天清理過期記錄
setInterval(cleanupQuotaRecords, 24 * 60 * 60 * 1000);

// 配額配置說明
export const quotaConfig = {
  freeTier: GOOGLE_API_QUOTAS.FREE_TIER,
  paidTier: GOOGLE_API_QUOTAS.PAID_TIER,
  description: 'Google Maps API 配額管理系統'
};
