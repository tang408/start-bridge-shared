import api from '../index.js';

export const successPlanApi = {
    async getSuccessPlanPhotos(params = {}) {
        return api.post("/f/public/success-plan/get-success-plan-photos", params);
    },

    async getSuccessPlan(params = {}) {
        return api.post("/f/public/success-plan/get-success-plan", params);
    }
}
