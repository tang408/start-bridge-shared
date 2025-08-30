import api from '../index.js';

export const officialFounderApi = {
  // 獲取創辦人列表
  async getOfficialFounders() {
    return api.post('/f/public/official-founder/get-official-founders');
  }
};
