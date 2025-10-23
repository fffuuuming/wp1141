import { initializeDatabase, closeDatabase } from '../../src/models/database';
import { UserModel } from '../../src/models/User';
import { LocationModel } from '../../src/models/Location';

async function clearAllData() {
  console.log('🧹 開始清理所有測試資料...\n');

  try {
    // 初始化資料庫連接
    await initializeDatabase();
    console.log('✅ 資料庫連接成功');

    // 清理所有地點資料
    console.log('📍 清理地點資料...');
    const allLocations = await LocationModel.findByUserId(1); // 假設使用 user_id = 1
    for (const location of allLocations) {
      await LocationModel.delete(location.id);
    }
    console.log(`✅ 已清理 ${allLocations.length} 個地點`);

    // 清理所有使用者資料（除了系統管理員）
    console.log('👤 清理使用者資料...');
    
    // 清理特定的測試使用者
    const testEmails = ['test@example.com', 'refactor@test.com', 'manual@test.com'];
    let deletedUsers = 0;
    
    for (const email of testEmails) {
      try {
        const user = await UserModel.findByEmail(email);
        if (user) {
          await UserModel.delete(user.id);
          deletedUsers++;
          console.log(`✅ 刪除測試使用者: ${user.username} (${user.email})`);
        }
      } catch (error: any) {
        console.warn(`⚠️ 刪除使用者 ${email} 失敗:`, error.message);
      }
    }
    
    console.log(`✅ 已清理 ${deletedUsers} 個測試使用者`);

    // 重置資料庫序列（SQLite 的 AUTOINCREMENT）
    console.log('🔄 重置資料庫序列...');
    const db = require('../../src/models/database').default;
    
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM sqlite_sequence WHERE name IN ("users", "locations")', (err: any) => {
        if (err) {
          console.warn('⚠️ 重置序列失敗（可能沒有資料）:', err.message);
        } else {
          console.log('✅ 資料庫序列已重置');
        }
        resolve();
      });
    });

    console.log('\n🎉 資料清理完成！');
    console.log('📊 清理統計:');
    console.log(`   - 清理地點: ${allLocations.length} 個`);
    console.log(`   - 清理使用者: ${deletedUsers} 個`);
    console.log(`   - 重置序列: 完成`);

  } catch (error) {
    console.error('❌ 資料清理失敗:', error);
    process.exit(1);
  } finally {
    // 關閉資料庫連接
    await closeDatabase();
    console.log('✅ 資料庫連接已關閉');
  }
}

// 執行清理
clearAllData().catch(console.error);
