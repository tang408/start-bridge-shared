import api from '../index.js';

export const aboutMeApi = {

    async getAboutMes() {
        return api.post('/f/public/about-me/get-about-mes');
    }
};
