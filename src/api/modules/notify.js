import api from "@/api/index.js";

export const notifyApi = {
    async getUserNotifies(params = {}) {
        return api.post('/f/private/notify/get-user-notify', params);
    },
    async updateUserNotify(params = {}) {
        return api.post('/f/private/notify/update-user-notify', params);
    },
    async deleteUserNotify(params = {}) {
        return api.post('/f/private/notify/delete-user-notify', params);
    },
    async getSalesNotify(params = {}) {
        return api.post('/f/private/notify/get-sales-notify', params);
    },
    async updateSalesNotify(params = {}) {
        return api.post('/f/private/notify/update-sales-notify', params);
    },
};
