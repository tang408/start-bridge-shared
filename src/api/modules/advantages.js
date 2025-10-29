import api from '../index.js';

export const advantagesApi = {

    async getAdvantages() {
        return api.post('/f/public/advantages/get-advantages');
    }
};
