import api from "@/api/index.js";

export const transactionApi = {
    async getTransactionByUser(params = {}) {
        return api.post("/f/private/transaction/get-transaction-by-user", params);
    },
}
