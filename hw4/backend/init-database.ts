import { initializeDatabase, closeDatabase } from './src/models/database';

async function initDatabase() {
  console.log('🚀 初始化 SQLite 資料庫...');
  
  try {
    await initializeDatabase();
    console.log('✅ 資料庫初始化完成！');
    console.log('📁 資料庫檔案位置: ../database/locations.db');
    console.log('📊 已建立的資料表:');
    console.log('   - users (使用者表)');
    console.log('   - locations (地點表)');
    console.log('🔍 已建立的索引:');
    console.log('   - idx_users_email');
    console.log('   - idx_users_username');
    console.log('   - idx_locations_user_id');
    console.log('   - idx_locations_category');
    console.log('   - idx_locations_rating');
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// 執行初始化
initDatabase();
