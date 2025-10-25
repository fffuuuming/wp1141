#!/usr/bin/env node

/**
 * JWT Secret 驗證工具
 * 用於檢查 JWT Secret 的強度和有效性
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// 檢查 JWT Secret 強度
function checkJWTSecretStrength(secret: string): {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // 長度檢查
  if (secret.length < 32) {
    issues.push('密鑰長度不足 32 字元');
    score -= 20;
  } else if (secret.length >= 64) {
    score += 20;
  } else {
    score += 10;
  }

  // 複雜度檢查
  const hasNumbers = /\d/.test(secret);
  const hasLetters = /[a-zA-Z]/.test(secret);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(secret);

  if (!hasNumbers) {
    issues.push('密鑰缺少數字');
    score -= 5;
  } else {
    score += 5;
  }

  if (!hasLetters) {
    issues.push('密鑰缺少字母');
    score -= 5;
  } else {
    score += 5;
  }

  if (!hasSpecialChars) {
    recommendations.push('建議包含特殊字元以增加安全性');
  } else {
    score += 10;
  }

  // 常見弱密鑰檢查
  const weakSecrets = [
    'password',
    '123456',
    'secret',
    'jwt-secret',
    'your-super-secret-jwt-key-change-this-in-production',
    'dev-secret',
    'test-secret'
  ];

  if (weakSecrets.includes(secret.toLowerCase())) {
    issues.push('使用了常見的弱密鑰');
    score -= 30;
  }

  // 隨機性檢查（簡單版本）
  const entropy = calculateEntropy(secret);
  if (entropy < 4) {
    issues.push('密鑰隨機性不足');
    score -= 15;
  } else if (entropy >= 5) {
    score += 15;
  }

  const isValid = issues.length === 0 && score >= 50;

  return {
    isValid,
    score: Math.max(0, Math.min(100, score)),
    issues,
    recommendations
  };
}

// 計算字串的熵值（簡化版本）
function calculateEntropy(str: string): number {
  const freq: { [key: string]: number } = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

// 生成安全的 JWT Secret
function generateSecureJWTSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

// 測試 JWT 功能
function testJWTFunctionality(secret: string): boolean {
  try {
    const payload = { userId: 1, username: 'test' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    return decoded !== null;
  } catch (error) {
    console.error('JWT 功能測試失敗:', error);
    return false;
  }
}

// 主函數
function main() {
  console.log('🔐 JWT Secret 驗證工具\n');

  // 檢查環境變數
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.log('❌ 未找到 JWT_SECRET 環境變數');
    console.log('💡 請在 .env 檔案中設定 JWT_SECRET');
    console.log('\n🔧 生成新的 JWT Secret:');
    const newSecret = generateSecureJWTSecret();
    console.log(`JWT_SECRET=${newSecret}`);
    return;
  }

  console.log(`📋 檢查 JWT Secret: ${jwtSecret.substring(0, 8)}...`);
  console.log(`📏 長度: ${jwtSecret.length} 字元\n`);

  // 強度檢查
  const strengthCheck = checkJWTSecretStrength(jwtSecret);
  
  console.log('📊 強度分析:');
  console.log(`   分數: ${strengthCheck.score}/100`);
  console.log(`   狀態: ${strengthCheck.isValid ? '✅ 安全' : '⚠️ 需要改進'}\n`);

  if (strengthCheck.issues.length > 0) {
    console.log('❌ 發現問題:');
    strengthCheck.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log('');
  }

  if (strengthCheck.recommendations.length > 0) {
    console.log('💡 建議:');
    strengthCheck.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
    console.log('');
  }

  // 功能測試
  console.log('🧪 功能測試:');
  const jwtWorks = testJWTFunctionality(jwtSecret);
  console.log(`   JWT 簽名/驗證: ${jwtWorks ? '✅ 正常' : '❌ 失敗'}\n`);

  // 環境建議
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`🌍 環境: ${isProduction ? '生產環境' : '開發環境'}`);
  
  if (isProduction && !strengthCheck.isValid) {
    console.log('🚨 警告: 生產環境的 JWT Secret 不符合安全要求！');
    console.log('🔧 建議生成新的安全密鑰:');
    const newSecret = generateSecureJWTSecret();
    console.log(`JWT_SECRET=${newSecret}`);
  } else if (!isProduction && !strengthCheck.isValid) {
    console.log('💡 開發環境可以使用較簡單的密鑰，但建議使用安全密鑰');
  }

  console.log('\n✨ 驗證完成！');
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

export { checkJWTSecretStrength, generateSecureJWTSecret, testJWTFunctionality };
