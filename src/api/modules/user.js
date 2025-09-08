import api from "@/api/index.js";

export const userApi = {
    /**
     * 創建 user 資料
     * @param {{}} params - 參數物件
     * @param {string} params.account - 使用者帳號
     * @param {string} params.password - 使用者密碼
     * @param {string} params.name - 使用者名稱
     * @param {number} params.sex - 使用者性別
     * @param {string} params.birthday - 使用者生日
     * @param {string} params.line - 使用者Line ID
     * @param {string} params.email - 使用者電子郵件
     * @param {number} params.budget - 使用者預算
     * @param {string} params.workStatus - 使用者工作狀態
     * @param {number} params.minBudget - 使用者最低預算
     * @param {number} params.maxBudget - 使用者最高預算
     * @param {number} params.industryType - 產業類型
     * @param {number} params.idNumberFileId - 身分證檔案 ID
     * @param {number} params.assetFileId - 財力證明檔案 ID
     * @param {number} params.pcrcFileId - 良民證檔案 ID
     * @param {number} params.referralCode - 推薦碼
     */

    async founderRegister(params = {}) {
        const finalParams = { ...params };
        return api.post('/f/public/user/founder-register', finalParams);
    },

     /**
     * 使用者登入
     * @param {{}} params - 參數物件
     * @param {string} params.account - 使用者帳號
     * @param {string} params.password - 使用者密碼
     * @returns {Promise} API 響應
     */

    async login(params = {}) {
        const finalParams = { ...params };
        return api.post('/f/public/user/login', finalParams);
    }
}
