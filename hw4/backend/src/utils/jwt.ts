import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 確保 JWT_SECRET 存在
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ 警告: 未設定 JWT_SECRET 環境變數，使用預設值');
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

export interface TokenResponse {
  token: string;
  expiresIn: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// 生成 JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 驗證 JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 從 Authorization header 中提取 token
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// 生成完整的認證回應
export function generateAuthResponse(user: { id: number; username: string; email: string }): TokenResponse {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };
  
  const token = generateToken(payload);
  
  return {
    token,
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
}
