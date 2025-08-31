import api from "@/api/index.js";

export const storeLocationApi = {
    /**
     * 獲取 StoreLocation 資料
     * @param {Object} params - 參數物件
     * @param {number} params.city - StoreLocation 類型
     * @param {number} params.industryType - StoreLocation 類型
     * @returns {Promise} API 響應
     */
    async getStoreLocations(params = {}) {
        // 設定預設值和驗證
        const defaultParams = {
            city: 0, // 預設類型
            industryType: 0 // 預設類型
        };

        const finalParams = { ...defaultParams, ...params };

        // 簡單的參數驗證（可選）
        if (typeof finalParams.type !== 'number') {
            console.warn('getStoreLocations: type should be a number');
        }

        return api.post('/f/public/store-location/get-store-locations', finalParams);
    }
};
