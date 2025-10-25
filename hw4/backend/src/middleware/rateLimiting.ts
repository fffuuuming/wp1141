import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response, NextFunction } from 'express';

// 通用速率限制配置
const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || {
      success: false,
      message: '請求過於頻繁，請稍後再試',
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // 返回速率限制資訊在 `RateLimit-*` headers
    legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: '請求過於頻繁，請稍後再試',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(options.windowMs / 1000)
      });
    }
  });
};

// 慢速限制配置
const createSlowDown = (options: {
  windowMs: number;
  delayAfter: number;
  delayMs: number;
}) => {
  return slowDown({
    windowMs: options.windowMs,
    delayAfter: options.delayAfter,
    delayMs: options.delayMs,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  });
};

// 認證相關 API 速率限制（較嚴格）
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 每 15 分鐘最多 5 次嘗試
  message: '登入嘗試過於頻繁，請 15 分鐘後再試',
  skipSuccessfulRequests: true
});

// 一般 API 速率限制
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 每 15 分鐘最多 100 次請求
  skipSuccessfulRequests: true
});

// Google API 速率限制（更嚴格）
export const googleApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 10, // 每分鐘最多 10 次 Google API 請求
  message: 'Google API 請求過於頻繁，請稍後再試'
});

// 地點管理 API 速率限制
export const locationApiRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 分鐘
  max: 50, // 每 5 分鐘最多 50 次地點相關請求
  skipSuccessfulRequests: true
});

// 慢速限制 - 當請求過於頻繁時逐漸增加延遲
export const slowDownLimit = createSlowDown({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  delayAfter: 50, // 50 次請求後開始延遲
  delayMs: 500 // 每次增加 500ms 延遲
});

// 針對特定 IP 的嚴格限制（用於防止濫用）
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 1000, // 每小時最多 1000 次請求
  message: 'IP 請求過於頻繁，請 1 小時後再試'
});

// 針對註冊 API 的特殊限制
export const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 3, // 每小時最多 3 次註冊嘗試
  message: '註冊嘗試過於頻繁，請 1 小時後再試'
});

// 針對密碼重設的特殊限制
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 3, // 每小時最多 3 次密碼重設嘗試
  message: '密碼重設請求過於頻繁，請 1 小時後再試'
});

// 動態速率限制 - 根據使用者狀態調整
export const dynamicRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // 如果是已認證使用者，給予更高的限制
  if ((req as any).user) {
    return createRateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200, // 已認證使用者每 15 分鐘 200 次請求
      skipSuccessfulRequests: true
    })(req, res, next);
  } else {
    // 未認證使用者使用一般限制
    return generalRateLimit(req, res, next);
  }
};

// 速率限制狀態檢查中間件
export const rateLimitStatus = (req: Request, res: Response, next: NextFunction) => {
  // 添加速率限制資訊到 response headers
  res.set({
    'X-RateLimit-Policy': 'Multi-tier rate limiting',
    'X-RateLimit-Info': 'Different limits for different endpoints'
  });
  next();
};

// 速率限制配置說明
export const rateLimitConfig = {
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    description: '認證 API - 每 15 分鐘最多 5 次嘗試'
  },
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    description: '一般 API - 每 15 分鐘最多 100 次請求'
  },
  googleApi: {
    windowMs: 60 * 1000,
    max: 10,
    description: 'Google API - 每分鐘最多 10 次請求'
  },
  locationApi: {
    windowMs: 5 * 60 * 1000,
    max: 50,
    description: '地點 API - 每 5 分鐘最多 50 次請求'
  },
  register: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    description: '註冊 API - 每小時最多 3 次嘗試'
  }
};
