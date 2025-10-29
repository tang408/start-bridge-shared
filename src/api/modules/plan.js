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
    },

    async getAllParticipantPlanByUser(params = {}) {
        return api.post("/f/private/plan/get-all-participant-plan-by-user", params);
    },

    async getAllParticipantPlanDetailByUser(params = {}) {
        return api.post("/f/private/plan/get-all-participant-plan-detail-by-user", params);
    },

    async getAllParticipantPlanRecordByUser(params = {}) {
        return api.post("/f/private/plan/get-all-participant-plan-record-by-user", params);
    },

    async getSalesContractByPlanUser(params = {}) {
        return api.post("/f/private/plan/get-sales-contract-by-plan-user", params);
    },

    async getAdminCoreContractByPlanUser(params = {}) {
        return api.post("/f/private/plan/get-admin-core-contract-by-plan-user", params);
    },

    async getParticipantPlan(params = {}) {
        return api.post("/f/private/plan/get-participant-plan", params);
    },

    async checkCreatePlanStatus(params = {}) {
        return api.post("/f/private/plan/check-create-plan-status", params);
    },

    async extendPlanDate(params = {}) {
        return api.post("/f/private/plan/extend-plan-date", params);
    },
    async endPlan(params = {}) {
        return api.post("/f/private/plan/end-plan", params);
    }
};
