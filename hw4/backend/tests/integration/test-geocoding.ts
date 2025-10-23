import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

async function testGeocoding() {
  console.log('🧪 測試地址轉座標功能...\n');

  try {
    // 測試地址
    const testAddress = '台北市信義區信義路五段7號';
    
    console.log(`📍 測試地址: ${testAddress}`);
    
    const response = await axios.post(`${API_BASE_URL}/api/google/geocode`, {
      address: testAddress
    });
    
    console.log('\n✅ API 回應成功');
    console.log('狀態碼:', response.status);
    console.log('\n📊 回應資料結構:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const { lat, lng, formatted_address } = response.data.data;
    
    console.log('\n📌 解析後的資料:');
    console.log(`   - 緯度 (lat): ${lat}`);
    console.log(`   - 經度 (lng): ${lng}`);
    console.log(`   - 格式化地址: ${formatted_address}`);
    
    if (lat && lng) {
      console.log('\n🎉 測試通過！座標格式正確');
    } else {
      console.log('\n❌ 測試失敗：缺少座標資料');
    }
    
  } catch (error: any) {
    console.error('\n❌ 測試失敗:');
    console.error('錯誤:', error.response?.data || error.message);
  }
}

testGeocoding();
