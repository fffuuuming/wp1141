import { Request, Response, NextFunction } from 'express';

// 自定義錯誤類別
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 預定義錯誤類別
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授權') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '禁止存取') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '找不到資源') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '資源衝突') {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = '內部伺服器錯誤') {
    super(message, 500);
  }
}

// 錯誤回應介面
interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  stack?: string;
}

// 全域錯誤處理中間件
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = 500;
  let message = '內部伺服器錯誤';
  let errorName = 'Internal Server Error';

  // 處理自定義錯誤
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorName = error.constructor.name.replace('Error', '');
  }
  // 處理驗證錯誤
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    errorName = 'Validation Error';
  }
  // 處理 JWT 錯誤
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '無效的認證 token';
    errorName = 'Unauthorized';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '認證 token 已過期';
    errorName = 'Unauthorized';
  }
  // 處理資料庫錯誤
  else if (error.name === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    message = '資料庫約束錯誤';
    errorName = 'Conflict';
  }

  // 記錄錯誤
  console.error(`❌ ${errorName}:`, {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // 建構錯誤回應
  const errorResponse: ErrorResponse = {
    error: errorName,
    message,
    timestamp: new Date().toISOString()
  };

  // 開發環境顯示堆疊追蹤
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

// 404 處理中間件
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
}

// 非同步錯誤捕獲包裝器
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
