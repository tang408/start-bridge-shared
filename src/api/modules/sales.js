import api from '../index.js';

export const salesApi = {
    async getSalesInfo(params = {}) {
        return api.post("/f/private/sales/get-sales-info", params);
    },

    async getAllUserBySales(params = {}) {
        return api.post("/f/private/sales/get-all-user-by-sales", params);
    },

    async getAllSalesBySales(params = {}) {
        return api.post("/f/private/sales/get-all-sales-by-sales", params);
    },

    async getAllPlanBySales(params = {}) {
        return api.post("/f/private/sales/get-all-plan-by-sales", params);
    },

    async getUserInfoBySales(params = {}) {
        return api.post("/f/private/sales/get-user-info-by-sales", params);
    },

    async getPlanInfoBySales(params = {}) {
        return api.post("/f/private/sales/get-plan-info-by-sales", params);
    },

    async resetPassword(params = {}) {
        return api.post("/f/private/sales/reset-password", params);
    },

    async getUserSignContractBySales(params = {}) {
        return api.post("/f/private/sales/get-user-sign-contract-by-sales", params);
    },

    async getUserSignCoreContractBySales(params = {}) {
        return api.post("/f/private/sales/get-user-sign-core-contract-by-sales", params);
    },

    async getPlanFinalContractBySales(params = {}) {
        return api.post("/f/private/sales/get-plan-final-contract-by-sales", params);
    },

    async getSalesPerformanceBySales(params = {}) {
        return api.post("/f/private/sales/get-sales-performance-by-sales", params);
    },

    async getStructure(params = {}) {
        return api.post("/f/private/sales/get-structure", params);
    }
};
