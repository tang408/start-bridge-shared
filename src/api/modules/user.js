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
    },

    /**
     * 獲取使用者資訊
     * @param {{}} params - 參數物件
     * @param {number} params.userId - 使用者 id
     * @returns {Promise} API 響應
     */
    async getUserInfo(params = {}) {
        const finalParams = {...params};
        return api.post('/f/private/user/get-user-info', finalParams);
    },

    /**
     * 更新使用者創創者+公司資訊
     * @param {{}} params - 參數物件
     * @param {number} params.userId - 使用者 id
     * @param {string} params.name - 使用者名稱
     * @param {number} params.sex - 使用者性別
     * @param {string} params.birthday - 使用者生日
     * @param {string} params.lineId - 使用者Line ID
     * @param {string} params.email - 使用者電子郵件
     * @param {number} params.budget - 使用者預算
     * @param {number} params.city - 使用者所在城市
     * @param {string} params.workStatus - 使用者工作狀態
     * @param {number} params.industryType - 產業類型
     * @param {number} params.assetsCertification - 財力證明 ID
     * @param {number} params.PCRCertification - 良民證 ID
     * @param {string} params.education - 學歷
     * @param {string} params.workExperience - 工作經歷
     * @param {string} params.companyName - 公司名稱
     * @param {string} params.companyNameEn - 公司英文名稱
     * @param {string} params.businessId - 公司統一編號
     * @param {string} params.logo - 公司 logo
     * @param {string} params.slogan - 公司 slogan
     * @param {string} params.info - 公司介紹
     * @param {string} params.bankAccountName - 公司銀行帳戶名稱
     * @param {string} params.bankAccountNumber - 公司銀行帳戶號碼
     * @param {string} params.profile - 介紹
     * @param {string} params.officialUrl - 官方網站
     * @param {string} params.facebookUrl - Facebook 網址
     * @param {string} params.instagramUrl - Instagram 網址
     * @param {number} params.status - 使用者狀態
     */

    async updateFounderAndCompany(params = {}) {
        const finalParams = {...params};
        return api.post('/f/private/user/update-founder-and-company', finalParams);
    },

    /**
     * 更新使用者共創者資訊
     * @param {{}} params - 參數物件
     * @param {number} params.userId - 使用者 id
     * @param {string} params.name - 使用者名稱
     * @param {number} params.sex - 使用者性別
     * @param {number} params.identityCertification - 身分證 ID
     * @param {number} params.secondaryCertification - 第二證件 ID
     * @param {string} params.birthday - 使用者生日
     * @param {string} params.lineId - 使用者Line ID
     * @param {string} params.email - 使用者電子郵件
     * @param {number} params.budget - 使用者預算
     * @param {number} params.workStatus - 使用者工作狀態
     * @param {number} params.minBudget - 使用者最低預算
     * @param {number} params.maxBudget - 使用者最高預算
     * @param {number} params.expectIndustryType - 期望產業類型
     * @param {number} params.investLimitYear - 投資年限
     * @param {boolean} params.investLimitYearIsShow - 投資年限是否顯示
     * @param {number} params.experience -  經歷
     * @param {boolean} params.experienceIsShow -  經歷是否顯示
     * @param {string} params.introduce -  介紹
     * @param {boolean} params.introduceIsShow -  介紹是否顯示
     * @param {number} params.status - 使用者狀態
     */

    async updateCoreFounder(params = {}) {
        const finalParams = {...params};
        return api.post('/f/private/user/update-core-founder', finalParams);
    }
}
