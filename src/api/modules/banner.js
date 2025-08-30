import api from "@/api/index.js";

export const bannerApi = {
    /**
     * 獲取 Banner 資料
     * @param {Object} params - 參數物件
     * @param {number} params.type - Banner 類型
     * @returns {Promise} API 響應
     */
    async getBanners(params = {}) {
        // 設定預設值和驗證
        const defaultParams = {
            type: 1 // 預設類型
        };

        const finalParams = { ...defaultParams, ...params };

        // 簡單的參數驗證（可選）
        if (typeof finalParams.type !== 'number') {
            console.warn('getBanners: type should be a number');
        }

        return api.post('/f/public/banner/get-banners', finalParams);
    }
};
