import { Request, Response, NextFunction } from 'express';

// 驗證錯誤介面
interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// 驗證規則介面
interface ValidationRule {
  field: string;
  rules: Array<{
    validator: (value: any) => boolean;
    message: string;
  }>;
}

// 自定義驗證中間件
export class CustomValidator {
  private errors: ValidationError[] = [];

  // 驗證字串不為空
  static notEmpty(value: any): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string') return false;
    return value.trim().length > 0;
  }

  // 驗證字串長度
  static isLength(value: any, options: { min?: number; max?: number }): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string') return false;
    const length = value.trim().length;
    if (options.min !== undefined && length < options.min) return false;
    if (options.max !== undefined && length > options.max) return false;
    return true;
  }

  // 驗證電子郵件
  static isEmail(value: any): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  // 驗證浮點數
  static isFloat(value: any, options?: { min?: number; max?: number }): boolean {
    if (value === undefined || value === null) return false;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (options?.min !== undefined && num < options.min) return false;
    if (options?.max !== undefined && num > options.max) return false;
    return true;
  }

  // 驗證整數
  static isInt(value: any, options?: { min?: number; max?: number }): boolean {
    if (value === undefined || value === null) return false;
    const num = parseInt(value, 10);
    if (isNaN(num) || !Number.isInteger(num)) return false;
    if (options?.min !== undefined && num < options.min) return false;
    if (options?.max !== undefined && num > options.max) return false;
    return true;
  }

  // 驗證正則表達式
  static matches(value: any, regex: RegExp): boolean {
    if (value === undefined || value === null) return false;
    return typeof value === 'string' && regex.test(value);
  }

  // 驗證值是否在指定範圍內
  static isIn(value: any, values: any[]): boolean {
    if (value === undefined || value === null) return false;
    return values.includes(value);
  }

  // 驗證字串類型
  static isString(value: any): boolean {
    return typeof value === 'string';
  }

  // 可選驗證（如果值存在才驗證）
  static optional(validator: (value: any) => boolean): (value: any) => boolean {
    return (value: any): boolean => {
      if (value === undefined || value === null || value === '') return true;
      return validator(value);
    };
  }

  // 標準化電子郵件
  static normalizeEmail(value: any): string {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
  }

  // 去除空白
  static trim(value: any): string {
    if (typeof value !== 'string') return value;
    return value.trim();
  }
}

// 驗證中間件工廠
export function createValidationMiddleware(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      // 檢查 rule 和 rule.field 是否存在
      if (!rule || !rule.field) {
        console.error('Invalid validation rule:', rule);
        continue;
      }

      const value = req.body?.[rule.field] || req.query?.[rule.field];
      
      // 檢查 rule.rules 是否存在
      if (!rule.rules || !Array.isArray(rule.rules)) {
        console.error('Invalid validation rules for field:', rule.field);
        continue;
      }

      for (const validationRule of rule.rules) {
        try {
          if (!validationRule.validator(value)) {
            errors.push({
              field: rule.field,
              message: validationRule.message,
              value: value
            });
            break; // 每個欄位只顯示第一個錯誤
          }
        } catch (error) {
          console.error(`Validation error for field ${rule.field}:`, error);
          errors.push({
            field: rule.field,
            message: validationRule.message,
            value: value
          });
          break;
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: '輸入資料驗證失敗',
        details: errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
}

// 處理驗證錯誤的中間件（保持向後兼容）
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  // 這個函數現在主要用於向後兼容
  // 實際的驗證邏輯已經在 createValidationMiddleware 中處理
  next();
}

// 常用的驗證規則組合
export const ValidationRules = {
  // 註冊驗證
  register: [
    {
      field: 'username',
      rules: [
        { validator: CustomValidator.notEmpty, message: '使用者名稱不能為空' },
        { validator: (v: any) => CustomValidator.isLength(v, { min: 3, max: 50 }), message: '使用者名稱長度必須在 3-50 個字元之間' },
        { validator: (v: any) => CustomValidator.matches(v, /^[a-zA-Z0-9_]+$/), message: '使用者名稱只能包含字母、數字和底線' }
      ]
    },
    {
      field: 'email',
      rules: [
        { validator: CustomValidator.notEmpty, message: '電子郵件不能為空' },
        { validator: CustomValidator.isEmail, message: '請提供有效的電子郵件地址' }
      ]
    },
    {
      field: 'password',
      rules: [
        { validator: CustomValidator.notEmpty, message: '密碼不能為空' },
        { validator: (v: any) => CustomValidator.isLength(v, { min: 8 }), message: '密碼長度至少需要 8 個字元' },
        { validator: (v: any) => CustomValidator.matches(v, /[A-Z]/), message: '密碼必須包含至少一個大寫字母' },
        { validator: (v: any) => CustomValidator.matches(v, /[a-z]/), message: '密碼必須包含至少一個小寫字母' },
        { validator: (v: any) => CustomValidator.matches(v, /\d/), message: '密碼必須包含至少一個數字' },
        { validator: (v: any) => CustomValidator.matches(v, /[@\$!%*?&]/), message: '密碼必須包含至少一個特殊字元 (@$!%*?&)' }
      ]
    }
  ],

  // 登入驗證
  login: [
    {
      field: 'emailOrUsername',
      rules: [
        { validator: CustomValidator.notEmpty, message: '請輸入電子郵件或使用者名稱' }
      ]
    },
    {
      field: 'password',
      rules: [
        { validator: CustomValidator.notEmpty, message: '密碼不能為空' }
      ]
    }
  ],

  // 地點驗證
  location: [
    {
      field: 'name',
      rules: [
        { validator: (v: any) => CustomValidator.isLength(v, { min: 1, max: 100 }), message: '地點名稱長度必須在 1-100 個字元之間' }
      ]
    },
    {
      field: 'description',
      rules: [
        { validator: CustomValidator.optional((v: any) => CustomValidator.isLength(v, { max: 500 })), message: '描述長度不能超過 500 個字元' }
      ]
    },
    {
      field: 'address',
      rules: [
        { validator: CustomValidator.optional((v: any) => CustomValidator.isLength(v, { max: 255 })), message: '地址長度不能超過 255 個字元' }
      ]
    },
    {
      field: 'latitude',
      rules: [
        { validator: (v: any) => CustomValidator.isFloat(v, { min: -90, max: 90 }), message: '緯度必須在 -90 到 90 之間' }
      ]
    },
    {
      field: 'longitude',
      rules: [
        { validator: (v: any) => CustomValidator.isFloat(v, { min: -180, max: 180 }), message: '經度必須在 -180 到 180 之間' }
      ]
    },
    {
      field: 'category',
      rules: [
        { validator: CustomValidator.optional((v: any) => CustomValidator.isLength(v, { max: 50 })), message: '分類長度不能超過 50 個字元' }
      ]
    },
    {
      field: 'rating',
      rules: [
        { validator: CustomValidator.optional((v: any) => CustomValidator.isInt(v, { min: 1, max: 5 })), message: '評分必須在 1 到 5 之間' }
      ]
    },
    {
      field: 'notes',
      rules: [
        { validator: CustomValidator.optional((v: any) => CustomValidator.isLength(v, { max: 1000 })), message: '備註長度不能超過 1000 個字元' }
      ]
    }
  ]
};

// 導出常用的驗證中間件
export const validateRegister = createValidationMiddleware(ValidationRules.register);
export const validateLogin = createValidationMiddleware(ValidationRules.login);
export const validateLocation = createValidationMiddleware(ValidationRules.location);
