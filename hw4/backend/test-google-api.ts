import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testGoogleAPI() {
  console.log('🗺️ 開始測試 Google Maps API...\n');

  try {
    // 測試 1: 地址轉座標
    console.log('1️⃣ 測試地址轉座標...');
    const geocodeResponse = await axios.post(`${BASE_URL}/google/geocode`, {
      address: '台北101'
    });
    console.log('✅ 地址轉座標成功:', geocodeResponse.data.data[0]?.formatted_address);

    const coordinates = geocodeResponse.data.data[0]?.geometry?.location;
    if (!coordinates) {
      throw new Error('無法取得座標');
    }

    // 測試 2: 座標轉地址
    console.log('\n2️⃣ 測試座標轉地址...');
    const reverseGeocodeResponse = await axios.post(`${BASE_URL}/google/reverse-geocode`, {
      lat: coordinates.lat,
      lng: coordinates.lng
    });
    console.log('✅ 座標轉地址成功:', reverseGeocodeResponse.data.data[0]?.formatted_address);

    // 測試 3: 搜尋附近地點
    console.log('\n3️⃣ 測試搜尋附近地點...');
    const nearbyResponse = await axios.post(`${BASE_URL}/google/places/nearby`, {
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius: 1000,
      type: 'restaurant'
    });
    console.log('✅ 搜尋附近地點成功:', nearbyResponse.data.data.length, '個結果');

    // 測試 4: 文字搜尋
    console.log('\n4️⃣ 測試文字搜尋...');
    const searchResponse = await axios.post(`${BASE_URL}/google/places/search`, {
      query: '台北咖啡廳'
    });
    console.log('✅ 文字搜尋成功:', searchResponse.data.data.length, '個結果');

    // 測試 5: 取得地點詳細資訊
    if (searchResponse.data.data.length > 0) {
      console.log('\n5️⃣ 測試取得地點詳細資訊...');
      const placeId = searchResponse.data.data[0].place_id;
      const detailsResponse = await axios.get(`${BASE_URL}/google/places/details/${placeId}`);
      console.log('✅ 取得地點詳細資訊成功:', detailsResponse.data.data.name);
    }

    // 測試 6: 計算路線
    console.log('\n6️⃣ 測試計算路線...');
    const directionsResponse = await axios.post(`${BASE_URL}/google/directions`, {
      origin: '台北車站',
      destination: '台北101',
      mode: 'driving'
    });
    console.log('✅ 計算路線成功:', directionsResponse.data.data.distance, directionsResponse.data.data.duration);

    // 測試 7: 計算距離矩陣
    console.log('\n7️⃣ 測試計算距離矩陣...');
    const distanceMatrixResponse = await axios.post(`${BASE_URL}/google/distance-matrix`, {
      origins: ['台北車站', '台北101'],
      destinations: ['西門町', '信義區'],
      mode: 'driving'
    });
    console.log('✅ 計算距離矩陣成功:', distanceMatrixResponse.data.data.length, '個結果');

    console.log('\n🎉 所有 Google Maps API 測試通過！');

  } catch (error: any) {
    console.error('❌ 測試失敗:', error.response?.data || error.message);
  }
}

// 執行測試
testGoogleAPI().catch(console.error);
