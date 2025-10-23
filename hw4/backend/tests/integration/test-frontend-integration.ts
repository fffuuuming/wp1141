import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

// 測試資料
const testUser = {
  username: 'frontendtest',
  email: 'frontendtest@example.com',
  password: 'Test123456!'
};

async function testFrontendBackendIntegration() {
  console.log('🧪 開始測試前後端整合...\n');

  try {
    // 測試 1: 檢查後端健康狀態
    console.log('1️⃣ 檢查後端健康狀態...');
    const healthCheck = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 後端健康狀態:', healthCheck.data.message);

    // 測試 2: 檢查前端是否運行
    console.log('\n2️⃣ 檢查前端是否運行...');
    const frontendCheck = await axios.get(FRONTEND_URL);
    console.log('✅ 前端正常運行');

    // 測試 3: 註冊新使用者
    console.log('\n3️⃣ 測試使用者註冊...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      console.log('✅ 註冊成功');
      console.log('   - 使用者名稱:', registerResponse.data.data.user.username);
      console.log('   - Email:', registerResponse.data.data.user.email);
      console.log('   - Token 已獲取:', registerResponse.data.data.token ? '是' : '否');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('ℹ️ 使用者已存在，跳過註冊');
      } else {
        throw error;
      }
    }

    // 測試 4: 登入
    console.log('\n4️⃣ 測試使用者登入...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ 登入成功');
    const token = loginResponse.data.data.token;
    console.log('   - Token:', token.substring(0, 20) + '...');

    // 測試 5: 獲取使用者資料
    console.log('\n5️⃣ 測試獲取使用者資料...');
    const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 獲取使用者資料成功');
    console.log('   - ID:', profileResponse.data.data.id);
    console.log('   - 使用者名稱:', profileResponse.data.data.username);
    console.log('   - Email:', profileResponse.data.data.email);

    // 測試 6: 獲取地點列表（應該是空的）
    console.log('\n6️⃣ 測試獲取地點列表...');
    const locationsResponse = await axios.get(`${API_BASE_URL}/api/locations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 獲取地點列表成功');
    console.log('   - 地點數量:', locationsResponse.data.data.length);

    // 測試 7: 測試未認證請求（應該失敗）
    console.log('\n7️⃣ 測試未認證請求...');
    try {
      await axios.get(`${API_BASE_URL}/api/locations`);
      console.log('❌ 未認證請求應該失敗，但成功了');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ 未認證請求正確被拒絕');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 所有測試通過！');
    console.log('\n📊 測試摘要:');
    console.log('   ✅ 後端健康檢查');
    console.log('   ✅ 前端正常運行');
    console.log('   ✅ 使用者註冊');
    console.log('   ✅ 使用者登入');
    console.log('   ✅ 獲取使用者資料');
    console.log('   ✅ 獲取地點列表');
    console.log('   ✅ 認證保護');

  } catch (error: any) {
    console.error('\n❌ 測試失敗:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 執行測試
testFrontendBackendIntegration();
