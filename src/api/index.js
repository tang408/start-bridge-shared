import axios from 'axios';

const LocalHost = 'http://localhost:8080/api';
const ReleaseHost ='http://43.213.118.243:8080/api';
// 創建 axios 實例
const api = axios.create({
  baseURL: LocalHost,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    console.log('發送請求:', config);
    return config;
  },
  (error) => {
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('收到響應:', response);
    return response.data;
  },
  (error) => {
    console.error('響應錯誤:', error);

    // 統一錯誤處理
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.error('未授權訪問');
          break;
        case 404:
          console.error('請求的資源不存在');
          break;
        case 500:
          console.error('服務器內部錯誤');
          break;
        default:
          console.error('請求失敗:', error.response.data?.message || '未知錯誤');
      }
    } else if (error.request) {
      console.error('網絡錯誤，請檢查網絡連接');
    } else {
      console.error('請求配置錯誤:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
