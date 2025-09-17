import api from '../index.js';

export const planApi = {
    async createPlan(params = {}) {
        return api.post("/f/private/plan/create-plan", params);
    }
};
