import api from '../index.js';

export const planApi = {
    async createPlan(params = {}) {
        return api.post("/f/private/plan/create-plan", params);
    },

    async getAllPlan(params = {}) {
        return api.post("/f/public/plan/get-all-plan", params);
    },

    async getPlan(params = {}) {
        return api.post("/f/public/plan/get-plan", params);
    },

    async participantPlan(params = {}) {
        return api.post("/f/private/plan/participant-plan", params);
    },

    async getAllPlanByUser(params = {}) {
        return api.post("/f/private/plan/get-all-plan-by-user", params);
    }


};
