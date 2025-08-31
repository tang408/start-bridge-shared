import api from '../index.js';

export const officialPartnerApi = {
    async getOfficialPartnerPhotos() {
        return api.post('/f/public/official-partner/get-official-partner-photos');
    },
    /**
     * 獲取 OfficialPartners 資料
     * @param {Object} params - 參數物件
     * @param {number} params.industryType - OfficialPartners 類型
     * @returns {Promise} API 響應
     */
    async getOfficialPartners(params = {}) {
        // 設定預設值和驗證
        const defaultParams = {
            industryType: 0 // 預設類型
        };

        const finalParams = {...defaultParams, ...params};

        // 簡單的參數驗證（可選）
        if (typeof finalParams.industryType !== 'number') {
            console.warn('getOfficialPartners: industryType should be a number');
        }

        return api.post('/f/public/official-partner/get-official-partners', finalParams);
    },
    /**
     * 獲取 OfficialPartner 資料
     * @param {Object} params - 參數物件
     * @param {number} params.officialPartnerId - OfficialPartner 類型
     * @returns {Promise} API 響應
     */
    async getOfficialPartner(params = {}) {
        // 設定預設值和驗證
        const defaultParams = {
            officialPartnerId: 0 // 預設類型
        };

        const finalParams = {...defaultParams, ...params};

        // 簡單的參數驗證（可選）
        if (typeof finalParams.industryType !== 'number') {
            console.warn('getOfficialPartners: industryType should be a number');
        }

        return api.post('/f/public/official-partner/get-official-partner', finalParams);
    },
};
