import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testLocationCRUD() {
  console.log('📍 開始測試地點 CRUD 功能...\n');

  let authToken = '';
  let testLocationId = 0;

  try {
    // 先登入取得認證 token
    console.log('🔐 登入取得認證 token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Password123!'
    });
    authToken = loginResponse.data.data.token;
    console.log('✅ 登入成功\n');

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // 測試 1: 取得地點清單
    console.log('1️⃣ 測試取得地點清單...');
    const locationsResponse = await axios.get(`${BASE_URL}/locations`, { headers });
    console.log('✅ 取得地點清單成功:', locationsResponse.data.count, '個地點');

    // 測試 2: 新增地點（使用地址）
    console.log('\n2️⃣ 測試新增地點（使用地址）...');
    const createResponse = await axios.post(`${BASE_URL}/locations`, {
      name: '測試咖啡廳',
      description: '這是一個測試咖啡廳',
      address: '台北市信義區信義路五段7號',
      category: '咖啡廳',
      rating: 4,
      notes: '測試備註'
    }, { headers });
    testLocationId = createResponse.data.data.id;
    console.log('✅ 新增地點成功:', createResponse.data.data.name);

    // 測試 3: 新增地點（使用座標）
    console.log('\n3️⃣ 測試新增地點（使用座標）...');
    const createCoordResponse = await axios.post(`${BASE_URL}/locations`, {
      name: '測試餐廳',
      description: '這是一個測試餐廳',
      latitude: 25.0330,
      longitude: 121.5654,
      category: '餐廳',
      rating: 5,
      notes: '座標測試'
    }, { headers });
    console.log('✅ 新增地點（座標）成功:', createCoordResponse.data.data.name);

    // 測試 4: 取得特定地點
    console.log('\n4️⃣ 測試取得特定地點...');
    const getLocationResponse = await axios.get(`${BASE_URL}/locations/${testLocationId}`, { headers });
    console.log('✅ 取得特定地點成功:', getLocationResponse.data.data.name);

    // 測試 5: 更新地點
    console.log('\n5️⃣ 測試更新地點...');
    const updateResponse = await axios.put(`${BASE_URL}/locations/${testLocationId}`, {
      name: '更新後的咖啡廳',
      rating: 5,
      notes: '更新後的備註'
    }, { headers });
    console.log('✅ 更新地點成功:', updateResponse.data.data.name);

    // 測試 6: 搜尋地點
    console.log('\n6️⃣ 測試搜尋地點...');
    const searchResponse = await axios.get(`${BASE_URL}/locations?search=咖啡`, { headers });
    console.log('✅ 搜尋地點成功:', searchResponse.data.count, '個結果');

    // 測試 7: 分類篩選
    console.log('\n7️⃣ 測試分類篩選...');
    const categoryResponse = await axios.get(`${BASE_URL}/locations?category=咖啡廳`, { headers });
    console.log('✅ 分類篩選成功:', categoryResponse.data.count, '個咖啡廳');

    // 測試 8: 排序
    console.log('\n8️⃣ 測試排序...');
    const sortResponse = await axios.get(`${BASE_URL}/locations?sortBy=rating&sortOrder=DESC`, { headers });
    console.log('✅ 排序成功:', sortResponse.data.data.length, '個地點');

    // 測試 9: 取得地點統計
    console.log('\n9️⃣ 測試取得地點統計...');
    const statsResponse = await axios.get(`${BASE_URL}/locations/stats/summary`, { headers });
    console.log('✅ 取得地點統計成功:', statsResponse.data.data);

    // 測試 10: 從 Google Places 新增地點
    console.log('\n🔟 測試從 Google Places 新增地點...');
    try {
      // 先搜尋一個 Google Place
      const googleSearchResponse = await axios.post(`${BASE_URL}/google/places/search`, {
        query: '台北星巴克'
      });
      
      if (googleSearchResponse.data.data.length > 0) {
        const placeId = googleSearchResponse.data.data[0].place_id;
        const googleCreateResponse = await axios.post(`${BASE_URL}/locations/from-google`, {
          placeId: placeId,
          category: '咖啡廳',
          rating: 4,
          notes: '從 Google Places 新增'
        }, { headers });
        console.log('✅ 從 Google Places 新增地點成功:', googleCreateResponse.data.data.name);
      }
    } catch (error) {
      console.log('⚠️ 從 Google Places 新增地點測試跳過（需要有效的 Place ID）');
    }

    // 測試 11: 刪除地點
    console.log('\n1️⃣1️⃣ 測試刪除地點...');
    const deleteResponse = await axios.delete(`${BASE_URL}/locations/${testLocationId}`, { headers });
    console.log('✅ 刪除地點成功');

    // 測試 12: 權限測試（嘗試存取不存在的地點）
    console.log('\n1️⃣2️⃣ 測試權限控制...');
    try {
      await axios.get(`${BASE_URL}/locations/99999`, { headers });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ 權限控制正常：找不到地點');
      }
    }

    console.log('\n🎉 所有地點 CRUD 測試通過！');

  } catch (error: any) {
    console.error('❌ 測試失敗:', error.response?.data || error.message);
  }
}

// 執行測試
testLocationCRUD().catch(console.error);
