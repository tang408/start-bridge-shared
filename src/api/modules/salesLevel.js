import api from "@/api/index.js";

export const salesLevelApi = {
    async getSalesLevel(params = {}) {
        return api.post("/f/public/sales-level/get-sales-level", params);
    }
}
