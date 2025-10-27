import api from "@/api/index.js";

export const industrySubTypeApi = {
    async getIndustrySubTypes(params = {}) {
        return api.post('/f/public/industry-sub-type/get-industry-sub-types');
    }
};
