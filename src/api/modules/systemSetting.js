import api from '../index.js';

export const systemSettingApi = {
    async getSystemSetting(params = {}) {
        return api.post("/f/private/system-setting/get-system-setting", params);
    },
}
