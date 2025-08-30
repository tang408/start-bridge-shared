import api from '../index.js';

export const officialPartnerApi = {

    async getOfficialPartnerPhotos() {
        return api.post('/f/public/official-partner/get-official-partner-photos');
    }
};
