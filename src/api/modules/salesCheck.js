import api from "@/api/index.js";

export const salesCheckApi = {
    async checkPlanBySales(params = {}) {
        return api.post("/f/private/sales-check/check-plan-by-sales", params);
    },

    async uploadContractBySales(params = {}) {
        return api.post("/f/private/sales-check/upload-contract-by-sales", params);
    },

    async checkContractBySales(params = {}) {
        return api.post("/f/private/sales-check/check-contract-by-sales", params);
    },

    async checkResourceBySales(params = {}) {
        return api.post("/f/private/sales-check/check-resource-by-sales", params);
    },

    async checkFranchiseBySales(params = {}) {
        return api.post("/f/private/sales-check/check-franchise-by-sales", params);
    },

    async checkAddressBySales(params = {}) {
        return api.post("/f/private/sales-check/check-address-by-sales", params);
    },

    async finishPlanBySales(params = {}) {
        return api.post("/f/private/sales-check/finish-plan-by-sales", params);
    },

    async checkCoreMoneyBySales(params = {}) {
        return api.post("/f/private/sales-check/check-core-money-by-sales", params);
    },

    async checkCoreContractBySales(params = {}) {
        return api.post("/f/private/sales-check/check-core-contract-by-sales", params);
    },

    async contactUserBySales(params = {}) {
        return api.post("/f/private/sales-check/contact-user-by-sales", params);
    },

    async uploadCorePlanFinalContractBySales(params = {}) {
        return api.post("/f/private/sales-check/upload-core-plan-final-contract-by-sales", params);
    }
}
