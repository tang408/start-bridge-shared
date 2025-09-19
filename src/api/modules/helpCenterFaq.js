
import api from '../index.js';

export const helpCenterFaqApi = {

    async createHelpCenterFaq(params = {}) {
        return api.post('/f/private/help-center-faq/create-help-center-faq', params);
    }
};
