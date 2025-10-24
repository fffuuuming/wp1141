/**
 * 樣式工具函數
 * 提供常用的樣式組合和工具函數
 */

import type { SxProps, Theme } from '@mui/material';
import { designTokens, commonStyles } from './designTokens';

// 常用樣式快捷方式
export const sx = {
  // 按鈕樣式
  primaryButton: commonStyles.primaryButton,
  secondaryButton: commonStyles.secondaryButton,
  whiteButton: commonStyles.whiteButton,
  
  // 容器樣式
  card: commonStyles.card,
  pageContainer: commonStyles.pageContainer,
  paperContainer: commonStyles.paperContainer,
  
  // 表單樣式
  textField: commonStyles.textField,
  
  // 文字樣式
  link: commonStyles.link,
  chip: commonStyles.chip,
  
  // 佈局樣式
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  // 間距樣式
  spacing: {
    xs: { gap: designTokens.spacing.xs },
    sm: { gap: designTokens.spacing.sm },
    md: { gap: designTokens.spacing.md },
    lg: { gap: designTokens.spacing.lg },
    xl: { gap: designTokens.spacing.xl },
    xxl: { gap: designTokens.spacing.xxl },
  },
  
  // 文字對齊
  textCenter: { textAlign: 'center' },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },
  
  // 陰影
  shadow: {
    sm: { boxShadow: designTokens.shadows.sm },
    md: { boxShadow: designTokens.shadows.md },
    lg: { boxShadow: designTokens.shadows.lg },
    xl: { boxShadow: designTokens.shadows.xl },
  },
  
  // 過渡效果
  transition: {
    fast: { transition: designTokens.transitions.fast },
    normal: { transition: designTokens.transitions.normal },
    slow: { transition: designTokens.transitions.slow },
  },
} as const;

// 顏色快捷方式
export const colors = designTokens.colors;

// 間距快捷方式
export const spacing = designTokens.spacing;

// 邊框圓角快捷方式
export const borderRadius = designTokens.borderRadius;

// 字體樣式快捷方式
export const typography = designTokens.typography;
