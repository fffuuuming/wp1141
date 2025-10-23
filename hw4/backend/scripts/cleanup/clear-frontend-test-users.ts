import { initializeDatabase, closeDatabase } from '../../src/models/database';
import { UserModel } from '../../src/models/User';

async function clearFrontendTestUsers() {
  console.log('🧹 清除前端測試使用者...\n');

  try {
    await initializeDatabase();
    
    // 清除前端測試使用者
    const frontendTestEmails = [
      'frontendtest@example.com',
      'testuser123@example.com',
      'test@test.com',
      'demo@example.com'
    ];

    let deletedCount = 0;

    for (const email of frontendTestEmails) {
      try {
        const user = await UserModel.findByEmail(email);
        if (user) {
          await UserModel.delete(user.id);
          console.log(`✅ 刪除使用者: ${user.username} (${user.email})`);
          deletedCount++;
        }
      } catch (error: any) {
        console.warn(`⚠️ 刪除使用者 ${email} 失敗:`, error.message);
      }
    }

    if (deletedCount === 0) {
      console.log('ℹ️ 沒有找到需要清除的測試使用者');
    } else {
      console.log(`\n🎉 成功清除 ${deletedCount} 個測試使用者`);
    }

  } catch (error) {
    console.error('❌ 清除失敗:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

clearFrontendTestUsers();
