import { initializeDatabase, closeDatabase } from './src/models/database';
import { UserModel } from './src/models/User';
import { LocationModel } from './src/models/Location';
import bcrypt from 'bcryptjs';

async function testDatabase() {
  console.log('🧪 開始測試 SQLite 資料庫...\n');

  try {
    // 初始化資料庫
    await initializeDatabase();
    console.log('✅ 資料庫初始化成功\n');

    // 測試使用者操作
    console.log('👤 測試使用者操作...');
    
    // 建立測試使用者
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword
    });
    console.log('✅ 建立使用者成功:', { id: testUser.id, username: testUser.username });

    // 查找使用者
    const foundUser = await UserModel.findByEmail('test@example.com');
    console.log('✅ 查找使用者成功:', { id: foundUser?.id, email: foundUser?.email });

    // 檢查 email 是否存在
    const emailExists = await UserModel.emailExists('test@example.com');
    console.log('✅ Email 存在檢查:', emailExists);

    console.log('\n📍 測試地點操作...');

    // 建立測試地點
    const testLocation = await LocationModel.create({
      user_id: testUser.id,
      name: '測試咖啡廳',
      description: '一家很棒的咖啡廳',
      address: '台北市信義區信義路五段7號',
      latitude: 25.0330,
      longitude: 121.5654,
      category: '咖啡廳',
      rating: 5,
      notes: '環境很棒，咖啡很好喝'
    });
    console.log('✅ 建立地點成功:', { id: testLocation.id, name: testLocation.name });

    // 建立第二個地點
    const testLocation2 = await LocationModel.create({
      user_id: testUser.id,
      name: '測試餐廳',
      description: '美味的餐廳',
      address: '台北市大安區敦化南路一段160號',
      latitude: 25.0419,
      longitude: 121.5489,
      category: '餐廳',
      rating: 4,
      notes: '食物很美味'
    });
    console.log('✅ 建立第二個地點成功:', { id: testLocation2.id, name: testLocation2.name });

    // 查找使用者的所有地點
    const userLocations = await LocationModel.findByUserId(testUser.id);
    console.log('✅ 查找使用者地點成功:', userLocations.length, '個地點');

    // 測試篩選功能
    const coffeeShops = await LocationModel.findByUserId(testUser.id, { category: '咖啡廳' });
    console.log('✅ 篩選咖啡廳成功:', coffeeShops.length, '個咖啡廳');

    // 測試搜尋功能
    const searchResults = await LocationModel.findByUserId(testUser.id, { search: '咖啡' });
    console.log('✅ 搜尋功能成功:', searchResults.length, '個結果');

    // 更新地點
    const updatedLocation = await LocationModel.update(testLocation.id, {
      rating: 4,
      notes: '更新後的備註'
    });
    console.log('✅ 更新地點成功:', updatedLocation?.rating, updatedLocation?.notes);

    // 取得統計資料
    const stats = await LocationModel.getStats(testUser.id);
    console.log('✅ 統計資料:', stats);

    // 取得分類列表
    const categories = await LocationModel.getCategories();
    console.log('✅ 分類列表:', categories);

    // 測試地點歸屬檢查
    const belongsToUser = await LocationModel.belongsToUser(testLocation.id, testUser.id);
    console.log('✅ 地點歸屬檢查:', belongsToUser);

    // 刪除測試資料
    await LocationModel.delete(testLocation.id);
    await LocationModel.delete(testLocation2.id);
    await UserModel.delete(testUser.id);
    console.log('✅ 清理測試資料成功');

    console.log('\n🎉 所有資料庫測試通過！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    // 關閉資料庫連接
    await closeDatabase();
  }
}

// 執行測試
testDatabase().catch(console.error);
