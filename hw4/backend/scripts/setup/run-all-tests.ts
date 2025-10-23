import { execSync } from 'child_process';
import path from 'path';

console.log('🧪 開始完整測試流程...\n');

try {
  // 步驟 1: 清理測試資料
  console.log('1️⃣ 清理測試資料...');
  execSync('ts-node clear-test-data.ts', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 測試資料清理完成\n');

  // 步驟 2: 準備測試環境
  console.log('2️⃣ 準備測試環境...');
  execSync('ts-node prepare-test-env.ts', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 測試環境準備完成\n');

  // 步驟 3: 執行所有測試
  console.log('3️⃣ 執行資料庫測試...');
  execSync('npm run test-db', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 資料庫測試完成\n');

  console.log('4️⃣ 執行認證測試...');
  execSync('npm run test-auth', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 認證測試完成\n');

  console.log('5️⃣ 執行 Google API 測試...');
  execSync('npm run test-google', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Google API 測試完成\n');

  console.log('6️⃣ 執行地點 CRUD 測試...');
  execSync('npm run test-location', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 地點 CRUD 測試完成\n');

  console.log('7️⃣ 執行重構測試...');
  execSync('npm run test-refactor', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 重構測試完成\n');

  console.log('🎉 所有測試完成！');
  console.log('📊 測試總結:');
  console.log('   ✅ 資料庫功能正常');
  console.log('   ✅ 認證系統正常');
  console.log('   ✅ Google API 正常');
  console.log('   ✅ 地點 CRUD 正常');
  console.log('   ✅ 重構功能正常');

} catch (error) {
  console.error('❌ 測試流程失敗:', error);
  process.exit(1);
}
