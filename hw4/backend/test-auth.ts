import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testAuthSystem() {
  console.log('🔐 開始測試認證系統...\n');

  let authToken = '';

  try {
    // 測試 1: 註冊新使用者
    console.log('1️⃣ 測試使用者註冊...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ 註冊成功:', registerResponse.data.message);
      authToken = registerResponse.data.data.token;
      console.log('🔑 取得認證 token:', authToken.substring(0, 20) + '...');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('⚠️ 使用者已存在，嘗試登入...');
        
        // 如果使用者已存在，嘗試登入
        const loginData = {
          email: 'test@example.com',
          password: 'Password123!'
        };
        
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
        console.log('✅ 登入成功:', loginResponse.data.message);
        authToken = loginResponse.data.data.token;
        console.log('🔑 取得認證 token:', authToken.substring(0, 20) + '...');
      } else {
        throw error;
      }
    }

    console.log('\n2️⃣ 測試取得使用者資料...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 取得使用者資料成功:', profileResponse.data.data.username);

    console.log('\n3️⃣ 測試更新使用者資料...');
    const updateData = {
      username: 'updateduser'
    };
    const updateResponse = await axios.put(`${BASE_URL}/auth/profile`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 更新使用者資料成功:', updateResponse.data.data.username);

    console.log('\n4️⃣ 測試無效 token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ 應該要失敗但沒有');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ 無效 token 正確被拒絕');
      } else {
        throw error;
      }
    }

    console.log('\n5️⃣ 測試缺少 token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log('❌ 應該要失敗但沒有');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ 缺少 token 正確被拒絕');
      } else {
        throw error;
      }
    }

    console.log('\n6️⃣ 測試登出...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 登出成功:', logoutResponse.data.message);

    console.log('\n7️⃣ 測試密碼驗證...');
    try {
      const weakPasswordData = {
        username: 'weakuser',
        email: 'weak@example.com',
        password: '123'
      };
      await axios.post(`${BASE_URL}/auth/register`, weakPasswordData);
      console.log('❌ 弱密碼應該被拒絕但沒有');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ 弱密碼正確被拒絕');
      } else {
        throw error;
      }
    }

    console.log('\n8️⃣ 測試重複註冊...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('❌ 重複註冊應該被拒絕但沒有');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('✅ 重複註冊正確被拒絕');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 所有認證系統測試通過！');

  } catch (error: any) {
    console.error('❌ 測試失敗:', error.response?.data || error.message);
  }
}

// 執行測試
testAuthSystem().catch(console.error);
