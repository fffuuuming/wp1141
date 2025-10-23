import { initializeDatabase, closeDatabase } from '../../src/models/database';
import { UserModel } from '../../src/models/User';
import { LocationModel } from '../../src/models/Location';
import bcrypt from 'bcryptjs';

async function prepareTestEnvironment() {
  console.log('🧪 準備測試環境...\n');

  try {
    // 初始化資料庫
    await initializeDatabase();
    console.log('✅ 資料庫初始化完成');

    // 建立測試使用者
    console.log('👤 建立測試使用者...');
    
    const testUsers = [
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123!'
      }
    ];

    for (const userData of testUsers) {
      try {
        // 檢查使用者是否已存在
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
          console.log(`ℹ️ 使用者 ${userData.email} 已存在，跳過建立`);
          continue;
        }

        // 建立新使用者
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await UserModel.create({
          username: userData.username,
          email: userData.email,
          password_hash: hashedPassword
        });
        console.log(`✅ 建立測試使用者: ${user.username} (${user.email})`);
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint')) {
          console.log(`ℹ️ 使用者 ${userData.email} 已存在，跳過建立`);
        } else {
          console.error(`❌ 建立使用者 ${userData.email} 失敗:`, error.message);
        }
      }
    }

    // 建立測試地點
    console.log('📍 建立測試地點...');
    
    const testUser = await UserModel.findByEmail('test@example.com');
    if (testUser) {
      const testLocations = [
        {
          name: '測試咖啡廳',
          description: '這是一個測試咖啡廳',
          address: '台北市信義區信義路五段7號',
          latitude: 25.0330,
          longitude: 121.5654,
          category: '咖啡廳',
          rating: 4,
          notes: '測試備註'
        },
        {
          name: '測試餐廳',
          description: '這是一個測試餐廳',
          address: '台北市大安區敦化南路一段236號',
          latitude: 25.0400,
          longitude: 121.5500,
          category: '餐廳',
          rating: 5,
          notes: '測試餐廳備註'
        }
      ];

      for (const locationData of testLocations) {
        try {
          const location = await LocationModel.create({
            user_id: testUser.id,
            ...locationData
          });
          console.log(`✅ 建立測試地點: ${location.name}`);
        } catch (error: any) {
          console.error(`❌ 建立地點 ${locationData.name} 失敗:`, error.message);
        }
      }
    }

    console.log('\n🎉 測試環境準備完成！');
    console.log('📊 準備結果:');
    console.log('   - 資料庫: 已初始化');
    console.log('   - 測試使用者: 已建立');
    console.log('   - 測試地點: 已建立');
    console.log('\n🔑 測試帳號:');
    console.log('   - Email: test@example.com');
    console.log('   - Password: Password123!');
    console.log('   - Email: admin@example.com');
    console.log('   - Password: Admin123!');

  } catch (error) {
    console.error('❌ 測試環境準備失敗:', error);
    process.exit(1);
  } finally {
    // 關閉資料庫連接
    await closeDatabase();
    console.log('✅ 資料庫連接已關閉');
  }
}

// 執行準備
prepareTestEnvironment().catch(console.error);
