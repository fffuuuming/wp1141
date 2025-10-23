import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import { UserModel } from '../models/User';

// 擴展 Request 介面以包含使用者資訊
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
      };
    }
  }
}

// JWT 認證中間件
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '缺少認證 token',
        timestamp: new Date().toISOString()
      });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '無效的認證 token',
        timestamp: new Date().toISOString()
      });
    }
    
    // 驗證使用者是否仍然存在
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '使用者不存在',
        timestamp: new Date().toISOString()
      });
    }
    
    // 將使用者資訊附加到請求物件
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    next();
    return;
  } catch (error) {
    console.error('認證中間件錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '認證過程中發生錯誤',
      timestamp: new Date().toISOString()
    });
    return;
  }
}

// 可選的認證中間件（不強制要求認證）
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = await UserModel.findById(payload.userId);
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email
          };
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('可選認證中間件錯誤:', error);
    next(); // 即使出錯也繼續執行
  }
}
