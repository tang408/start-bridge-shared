import api from '../index.js';

export const cityApi = {

    async getCities() {
        return api.post('/f/public/city/get-cities');
    }
};
