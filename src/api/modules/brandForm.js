import api from "@/api/index.js";

export const brandFormApi = {
    async createBrandForm(params = {}) {
        return api.post("/f/public/brand-form/create-brand-form", params);
    },

    async getBrandFormOptions(params = {}) {
        return api.post("/f/public/brand-form/get-brand-form-options", params);
    }
}

