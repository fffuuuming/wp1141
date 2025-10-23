#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import path from 'path';

// 測試配置
const TEST_CONFIG = {
  // 測試腳本路徑
  scripts: {
    cleanup: path.join(__dirname, 'scripts', 'cleanup'),
    setup: path.join(__dirname, 'scripts', 'setup'),
    integration: path.join(__dirname, 'tests', 'integration')
  },
  
  // 測試順序
  testOrder: [
    'clear-test-data.ts',
    'prepare-test-env.ts',
    'test-database.ts',
    'test-auth.ts',
    'test-google-api.ts',
    'test-location-crud.ts',
    'test-refactor.ts'
  ]
};

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: number, total: number, message: string): void {
  log(`\n${step}/${total} ${message}`, colors.cyan);
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string): void {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string): void {
  log(`⚠️ ${message}`, colors.yellow);
}

// 執行腳本
function runScript(scriptPath: string, description: string): boolean {
  try {
    log(`執行: ${description}`, colors.blue);
    execSync(`ts-node "${scriptPath}"`, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') // 回到 backend 目錄
    });
    return true;
  } catch (error) {
    logError(`${description} 失敗`);
    return false;
  }
}

// 主測試函數
async function runAllTests(): Promise<void> {
  log('🧪 開始完整測試流程...', colors.bright);
  
  const totalSteps = TEST_CONFIG.testOrder.length;
  let currentStep = 0;
  let successCount = 0;

  // 步驟 1: 清理測試資料
  currentStep++;
  logStep(currentStep, totalSteps, '清理測試資料');
  if (runScript(
    path.join(TEST_CONFIG.scripts.cleanup, 'clear-test-data.ts'),
    '清理測試資料'
  )) {
    successCount++;
  }

  // 步驟 2: 準備測試環境
  currentStep++;
  logStep(currentStep, totalSteps, '準備測試環境');
  if (runScript(
    path.join(TEST_CONFIG.scripts.setup, 'prepare-test-env.ts'),
    '準備測試環境'
  )) {
    successCount++;
  }

  // 步驟 3-7: 執行各種測試
  const testDescriptions = [
    '資料庫功能測試',
    '認證系統測試',
    'Google API 測試',
    '地點 CRUD 測試',
    '重構功能測試'
  ];

  for (let i = 2; i < TEST_CONFIG.testOrder.length; i++) {
    currentStep++;
    const testFile = TEST_CONFIG.testOrder[i];
    const description = testDescriptions[i - 2] || `測試 ${testFile}`;
    
    logStep(currentStep, totalSteps, description);
    
    if (runScript(
      path.join(TEST_CONFIG.scripts.integration, testFile),
      description
    )) {
      successCount++;
    }
  }

  // 測試摘要
  log('\n📊 測試摘要:', colors.bright);
  log(`   ✅ 成功: ${successCount}/${totalSteps}`, colors.green);
  log(`   ❌ 失敗: ${totalSteps - successCount}/${totalSteps}`, colors.red);

  if (successCount === totalSteps) {
    log('\n🎉 所有測試完成！', colors.green);
    log('📋 測試總結:', colors.bright);
    log('   ✅ 資料庫功能正常');
    log('   ✅ 認證系統正常');
    log('   ✅ Google API 正常');
    log('   ✅ 地點 CRUD 正常');
    log('   ✅ 重構功能正常');
  } else {
    log('\n⚠️ 部分測試失敗，請檢查錯誤訊息', colors.yellow);
    process.exit(1);
  }
}

// 單一測試執行
async function runSingleTest(testName: string): Promise<void> {
  const testMap: Record<string, string> = {
    'db': 'test-database.ts',
    'auth': 'test-auth.ts',
    'google': 'test-google-api.ts',
    'location': 'test-location-crud.ts',
    'refactor': 'test-refactor.ts'
  };

  const testFile = testMap[testName];
  if (!testFile) {
    logError(`未知的測試: ${testName}`);
    log('可用的測試:', colors.yellow);
    Object.keys(testMap).forEach(key => {
      log(`   - ${key}: ${testMap[key]}`);
    });
    process.exit(1);
  }

  log(`🧪 執行單一測試: ${testName}`, colors.bright);
  
  if (runScript(
    path.join(TEST_CONFIG.scripts.integration, testFile),
    `${testName} 測試`
  )) {
    logSuccess(`${testName} 測試完成`);
  } else {
    logError(`${testName} 測試失敗`);
    process.exit(1);
  }
}

// 清理環境
async function cleanupEnvironment(): Promise<void> {
  log('🧹 清理測試環境...', colors.bright);
  
  if (runScript(
    path.join(TEST_CONFIG.scripts.cleanup, 'clear-test-data.ts'),
    '清理測試資料'
  )) {
    logSuccess('環境清理完成');
  } else {
    logError('環境清理失敗');
    process.exit(1);
  }
}

// 準備環境
async function prepareEnvironment(): Promise<void> {
  log('🧪 準備測試環境...', colors.bright);
  
  if (runScript(
    path.join(TEST_CONFIG.scripts.setup, 'prepare-test-env.ts'),
    '準備測試環境'
  )) {
    logSuccess('環境準備完成');
  } else {
    logError('環境準備失敗');
    process.exit(1);
  }
}

// 主程式
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'all':
      await runAllTests();
      break;
    case 'single':
      if (!args[1]) {
        logError('請指定測試名稱');
        process.exit(1);
      }
      await runSingleTest(args[1]);
      break;
    case 'cleanup':
      await cleanupEnvironment();
      break;
    case 'prepare':
      await prepareEnvironment();
      break;
    case 'help':
    default:
      log('🧪 測試執行器', colors.bright);
      log('\n用法:', colors.yellow);
      log('  npm run test:all        - 執行所有測試');
      log('  npm run test:single <name> - 執行單一測試');
      log('  npm run test:cleanup   - 清理測試環境');
      log('  npm run test:prepare   - 準備測試環境');
      log('\n可用的單一測試:', colors.yellow);
      log('  db       - 資料庫功能測試');
      log('  auth     - 認證系統測試');
      log('  google   - Google API 測試');
      log('  location - 地點 CRUD 測試');
      log('  refactor - 重構功能測試');
      break;
  }
}

// 執行主程式
main().catch(error => {
  logError(`執行失敗: ${error.message}`);
  process.exit(1);
});
