import api from '../index.js';

export const lectureApi = {

    async getLectures(params = {}) {
        return api.post('/f/private/lecture/get-lectures', params);
    },

    async applyLecture(params = {}) {
        return api.post('/f/private/lecture/apply-lecture', params);
    }
};
