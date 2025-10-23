// Google Maps API Loader
let isLoading = false;
let isLoaded = false;
const callbacks: Array<() => void> = [];

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果已經載入，直接 resolve
    if (isLoaded) {
      resolve();
      return;
    }

    // 如果正在載入，加入回調隊列
    if (isLoading) {
      callbacks.push(() => resolve());
      return;
    }

    // 開始載入
    isLoading = true;

    // 從環境變數獲取 API Key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_JS_KEY;
    
    if (!apiKey) {
      const error = new Error('Google Maps API Key 未設定，請檢查 .env 檔案');
      console.error(error);
      reject(error);
      return;
    }

    // 創建 script 標籤
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=zh-TW`;
    script.async = true;
    script.defer = true;

    // 載入成功
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      
      // 執行所有等待的回調
      callbacks.forEach(cb => cb());
      callbacks.length = 0;
      
      resolve();
    };

    // 載入失敗
    script.onerror = (error) => {
      isLoading = false;
      const err = new Error('Google Maps API 載入失敗');
      console.error(err, error);
      reject(err);
    };

    // 添加到 head
    document.head.appendChild(script);
  });
};

// 檢查 API 是否已載入
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined';
};

