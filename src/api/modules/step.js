import api from "@/api/index.js";

export const stepApi = {
    async getAllPlanStep(params = {}) {
        return api.post("/f/public/step/get-all-plan-step", params);
    },

    async getAllCorePlanStep(params = {}) {
        return api.post("/f/public/step/get-all-core-plan-step", params);
    }
}
