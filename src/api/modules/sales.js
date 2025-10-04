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
};
