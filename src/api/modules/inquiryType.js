import api from "@/api/index.js";

export const inquiryTypeApi = {
    async getInquiryTypes(params = {}) {
        return api.post('/f/private/inquiry-type/get-inquiry-types', params);
    }
};
