import api from '../index.js';

// 創辦人相關的 API
export const officialFounderApi = {
  // 獲取創辦人列表
  async getOfficialFounders() {
    return api.post('/f/public/official-founder/get-official-founders');
  }
};
