import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// 處理驗證錯誤的中間件
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation Error',
      message: '輸入資料驗證失敗',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
    return;
  }
  next();
  return;
}

// 註冊驗證規則
export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('使用者名稱長度必須在 3-50 個字元之間')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('使用者名稱只能包含字母、數字和底線'),
  
  body('email')
    .isEmail()
    .withMessage('請提供有效的電子郵件地址')
    .normalizeEmail(),
  
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
    .withMessage('密碼必須包含至少一個特殊字元 (@$!%*?&)'),
  
  handleValidationErrors
];

// 登入驗證規則
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('請提供有效的電子郵件地址')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('密碼不能為空'),
  
  handleValidationErrors
];

// 地點驗證規則
export const validateLocation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('地點名稱長度必須在 1-100 個字元之間'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述長度不能超過 500 個字元'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('地址長度不能超過 255 個字元'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('緯度必須在 -90 到 90 之間'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('經度必須在 -180 到 180 之間'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('分類長度不能超過 50 個字元'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('評分必須在 1 到 5 之間'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('備註長度不能超過 1000 個字元'),
  
  handleValidationErrors
];
