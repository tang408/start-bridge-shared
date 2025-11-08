import api from "@/api/index.js";

export const userCheckApi = {
    async createReleaseChargeInfoByUser(params = {}) {
        return api.post("/f/private/user-check/create-release-charge-info-by-user", params);
    },

    async createContractPaymentInfoByUser(params = {}) {
        return api.post("/f/private/user-check/create-contract-payment-info-by-user", params);
    },

    async signContractByUser(params = {}) {
        return api.post("/f/private/user-check/sign-contract-by-user", params);
    },

    async signContractSubmitByUser(params = {}) {
        return api.post("/f/private/user-check/sign-contract-submit-by-user", params);
    },

    async signCoreContractByUser(params = {}) {
        return api.post("/f/private/user-check/sign-core-contract-by-user", params);
    },

    async signCoreContractSubmitByUser(params = {}) {
        return api.post("/f/private/user-check/sign-core-contract-submit-by-user", params);
    },

    async createCoreServiceChargeInfoByUser(params = {}) {
        return api.post("/f/private/user-check/create-core-service-charge-info-by-user", params);
    },

    async uploadCorePlanFinalContractByUser(params = {}) {
        return api.post("/f/private/user-check/upload-core-plan-final-contract-by-user", params);
    },

    async updateCompanyInfoByUser(params = {}) {
        return api.post("/f/private/user-check/update-company-info-by-user", params);
    }

}
