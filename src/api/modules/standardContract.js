import api from '../index.js';

export const standardContractApi = {

    async getStandardContracts(params = {}) {
        return api.post('/f/private/standard-contract/get-standard-contracts', params);
    }
};
