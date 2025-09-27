import api from "@/api/index.js";

export const userFavoritePlanApi = {
    async getUserFavoritePlans(params = {}) {
        return api.post("/f/private/user-favorite-plan/get-user-favorite-plans", params);
    },

    async createUserFavoritePlan(params = {}) {
        return api.post("/f/private/user-favorite-plan/create-user-favorite-plan", params);
    },

    async deleteUserFavoritePlan(params = {}) {
        return api.post("/f/private/user-favorite-plan/delete-user-favorite-plan", params);
    },
}
