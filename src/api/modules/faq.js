import api from '../index.js';

export const FAQApi = {
    async getFAQs() {
        return api.post('/f/public/faq/get-faqs');
    }
};
