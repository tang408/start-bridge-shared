import api from '../index.js';

export const partnerInterviewApi = {
    async getPartnerInterviewPhotos(params = {}) {
        return api.post("/f/public/partner-interview/get-partner-interview-photos", params);
    },

    async getPartnerInterview(params = {}) {
        return api.post("/f/public/partner-interview/get-partner-interview", params);
    }
}
