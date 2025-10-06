import api from "@/api/index.js";

export const salesCheckApi = {
    async checkPlanBySales(params = {}) {
        return api.post("/f/private/sales-check/check-plan-by-sales", params);
    },

    async paymentNotifyBySales(params = {}) {
        return api.post("/f/private/sales-check/payment-notify-by-sales", params);
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
    }
}
