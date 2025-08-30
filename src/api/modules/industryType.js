import api from "@/api/index.js";

export const industryTypeApi = {
    async getIndustryTypes(params = {}) {
        return api.post('/f/public/industry-type/get-industry-types');
    }
};
