import api from '../index.js';

export const optionApi = {

    async getOptions() {
        return api.post('/f/public/option/get-options');
    }
};
