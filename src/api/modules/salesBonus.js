import api from '../index.js';

export const salesBonusApi = {
    async getAllSalesBonusBySales(params = {}) {
        return api.post("/f/private/sales/get-all-sales-bonus-by-sales", params);
    }
}
