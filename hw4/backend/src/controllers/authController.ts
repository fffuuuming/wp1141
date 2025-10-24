import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateAuthResponse } from '../utils/jwt';

// 使用者註冊
// 注意：格式驗證由 validateRegister 中間件處理
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    
    // 注意：此處不需要檢查必要欄位，因為 validateRegister 中間件已經驗證過了
    // 如果執行到這裡，代表所有格式驗證都已通過
    
    // 檢查 email 是否已存在
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        error: 'Conflict',
        message: '此電子郵件地址已被使用',
        timestamp: new Date().toISOString()
      });
    }
    
    // 檢查 username 是否已存在
    const usernameExists = await UserModel.usernameExists(username);
    if (usernameExists) {
      return res.status(409).json({
        error: 'Conflict',
        message: '此使用者名稱已被使用',
        timestamp: new Date().toISOString()
      });
    }
    
    // 雜湊密碼
    const passwordHash = await hashPassword(password);
    
    // 建立使用者
    const user = await UserModel.create({
      username,
      email,
      password_hash: passwordHash
    });
    
    // 生成認證回應
    const authResponse = generateAuthResponse({
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    res.status(201).json({
      message: '使用者註冊成功',
      data: authResponse,
      timestamp: new Date().toISOString()
    });
    return;
    
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '註冊過程中發生錯誤',
      timestamp: new Date().toISOString()
    });
    return;
  }
}

// 使用者登入
// 注意：格式驗證由 validateLogin 中間件處理
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // 注意：此處不需要檢查必要欄位，因為 validateLogin 中間件已經驗證過了
    // 如果執行到這裡，代表所有格式驗證都已通過
    
    // 查找使用者
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '無效的電子郵件或密碼',
        timestamp: new Date().toISOString()
      });
    }
    
    // 驗證密碼
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '無效的電子郵件或密碼',
        timestamp: new Date().toISOString()
      });
    }
    
    // 生成認證回應
    const authResponse = generateAuthResponse({
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    res.json({
      message: '登入成功',
      data: authResponse,
      timestamp: new Date().toISOString()
    });
    return;
    
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '登入過程中發生錯誤',
      timestamp: new Date().toISOString()
    });
    return;
  }
}

// 取得使用者資料
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '使用者不存在',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      message: '取得使用者資料成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      timestamp: new Date().toISOString()
    });
    return;
    
  } catch (error) {
    console.error('取得使用者資料錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '取得使用者資料時發生錯誤',
      timestamp: new Date().toISOString()
    });
    return;
  }
}

// 更新使用者資料
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { username, email } = req.body;
    
    // 檢查 email 是否已被其他使用者使用
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          error: 'Conflict',
          message: '此電子郵件地址已被其他使用者使用',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // 檢查 username 是否已被其他使用者使用
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          error: 'Conflict',
          message: '此使用者名稱已被其他使用者使用',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // 更新使用者資料
    const updatedUser = await UserModel.update(userId, { username, email });
    if (!updatedUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: '使用者不存在',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      message: '使用者資料更新成功',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        updated_at: updatedUser.updated_at
      },
      timestamp: new Date().toISOString()
    });
    return;
    
  } catch (error) {
    console.error('更新使用者資料錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '更新使用者資料時發生錯誤',
      timestamp: new Date().toISOString()
    });
    return;
  }
}

// 登出（客戶端處理，這裡只是確認）
export async function logout(req: Request, res: Response) {
  res.json({
    message: '登出成功',
    timestamp: new Date().toISOString()
  });
}
