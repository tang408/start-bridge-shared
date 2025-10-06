import api from "@/api/index.js";

export const userCheckApi = {
    async createContractPaymentInfoByUser(params = {}) {
        return api.post("/f/private/user-check/create-contract-payment-info-by-user", params);
    },

    async uploadContractByUser(params = {}) {
        return api.post("/f/private/user-check/upload-contract-by-user", params);
    },
}
