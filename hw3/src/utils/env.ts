// 環境變數類型定義
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// 環境變數工具
export const getEnv = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined' && (window as any).process?.env) {
    return (window as any).process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
};

export const isDevelopment = (): boolean => {
  return getEnv('NODE_ENV', 'development') === 'development';
};

export const isProduction = (): boolean => {
  return getEnv('NODE_ENV', 'development') === 'production';
};

export const isTest = (): boolean => {
  return getEnv('NODE_ENV', 'development') === 'test';
};
