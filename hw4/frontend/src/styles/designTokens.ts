/**
 * 統一樣式系統
 * 定義應用程式的設計令牌和常用樣式
 */

// 設計令牌
export const designTokens = {
  colors: {
    primary: '#ff6b35',
    primaryHover: '#e55a2b',
    primaryLight: 'rgba(255, 107, 53, 0.1)',
    primaryBorder: 'rgba(255, 107, 53, 0.3)',
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e0e0e0',
      300: '#d0d0d0',
      400: '#a0a0a0',
      500: '#808080',
      600: '#606060',
      700: '#404040',
      800: '#202020',
      900: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
      overlay: 'rgba(255, 255, 255, 0.1)',
    },
  },
  spacing: {
    xs: 0.5,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 6,
  },
  borderRadius: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
  },
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 8px rgba(0,0,0,0.1)',
    lg: '0 8px 16px rgba(0,0,0,0.1)',
    xl: '0 12px 24px rgba(0,0,0,0.15)',
  },
  transitions: {
    fast: 'all 0.2s ease',
    normal: 'all 0.3s ease',
    slow: 'all 0.5s ease',
  },
} as const;

// 常用樣式組合
export const commonStyles = {
  // 主要按鈕樣式
  primaryButton: {
    border: `2px solid ${designTokens.colors.primary}`,
    borderRadius: designTokens.borderRadius.md,
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.primary,
    textTransform: 'none' as const,
    transition: designTokens.transitions.normal,
    '&:hover': {
      backgroundColor: designTokens.colors.primary,
      color: designTokens.colors.white,
    },
    '&:disabled': {
      borderColor: designTokens.colors.gray[200],
      color: designTokens.colors.gray[200],
    },
  },

  // 次要按鈕樣式
  secondaryButton: {
    border: `2px solid ${designTokens.colors.gray[200]}`,
    borderRadius: designTokens.borderRadius.md,
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.black,
    textTransform: 'none' as const,
    transition: designTokens.transitions.normal,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      borderColor: designTokens.colors.black,
    },
  },

  // 白色按鈕樣式（用於深色背景）
  whiteButton: {
    border: `2px solid ${designTokens.colors.white}`,
    borderRadius: designTokens.borderRadius.md,
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.white,
    textTransform: 'none' as const,
    backgroundColor: designTokens.colors.background.overlay,
    backdropFilter: 'blur(10px)',
    transition: designTokens.transitions.normal,
    '&:hover': {
      backgroundColor: designTokens.colors.primary,
      borderColor: designTokens.colors.primary,
      color: designTokens.colors.white,
    },
  },

  // 卡片樣式
  card: {
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${designTokens.colors.gray[200]}`,
    backgroundColor: designTokens.colors.background.paper,
    transition: designTokens.transitions.normal,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: designTokens.shadows.lg,
    },
  },

  // 輸入框樣式
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: designTokens.borderRadius.md,
      backgroundColor: designTokens.colors.white,
      '& fieldset': {
        borderColor: designTokens.colors.gray[200],
      },
      '&:hover fieldset': {
        borderColor: designTokens.colors.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: designTokens.colors.primary,
      },
    },
  },

  // 連結樣式
  link: {
    color: designTokens.colors.primary,
    fontWeight: designTokens.typography.fontWeight.bold,
    textDecoration: 'none',
    transition: designTokens.transitions.fast,
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  // 標籤樣式
  chip: {
    backgroundColor: designTokens.colors.primaryLight,
    color: designTokens.colors.primary,
    fontWeight: designTokens.typography.fontWeight.bold,
    border: `1px solid ${designTokens.colors.primaryBorder}`,
  },

  // 頁面容器樣式
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: designTokens.colors.background.default,
    pt: 8, // 為 Header 留出空間
  },

  // 紙張容器樣式
  paperContainer: {
    p: 3,
    border: `1px solid ${designTokens.colors.gray[200]}`,
    borderRadius: designTokens.borderRadius.lg,
    backgroundColor: designTokens.colors.gray[50],
  },
} as const;

// 響應式斷點
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

// 工具函數
export const getResponsiveValue = <T>(values: Record<string, T>, defaultValue: T): T => {
  // 這裡可以實現響應式值的邏輯
  return defaultValue;
};

// 導出類型
export type DesignTokens = typeof designTokens;
export type CommonStyles = typeof commonStyles;
export type Breakpoints = typeof breakpoints;
