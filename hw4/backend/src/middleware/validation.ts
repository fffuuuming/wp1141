// 重新導出自定義驗證中間件，保持向後兼容
export { 
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateLocation,
  createValidationMiddleware,
  CustomValidator,
  ValidationRules
} from './customValidation';
