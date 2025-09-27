import api from "@/api/index.js";

export const salesCheckApi = {
    async checkPlanBySales(params = {}) {
        return api.post("/f/private/sales-check/check-plan-by-sales", params);
    }
}
