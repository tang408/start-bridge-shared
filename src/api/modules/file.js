import api from '../index.js';

export const fileApi = {

    async uploadFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF, PDF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/public/file/create-proof-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async deleteFile(params = {}) {
        const defaultParams = {
            id: 0,
            name: null,
        };
        const finalParams = { ...defaultParams, ...params };
        if (typeof finalParams.id !== 'number' || finalParams.id <= 0) {
            throw new Error('請提供有效的檔案 ID');
        }
        if (params.name === 'companyLogo') {
            return api.post('/f/public/file/delete-image-file', finalParams)
        } else {
            return api.post('/f/public/file/delete-proof-file', finalParams)
        }

    },

    async getProofFiles(params = {}) {
        const defaultParams = {
            userId: 0
        };
        const finalParams = { ...defaultParams, ...params };

        return api.post('/f/public/file/get-proof-files', finalParams)
    },

    async uploadImageFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/public/file/create-image-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async uploadPaymentProofByUser(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-user-payment-proof-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async uploadContractFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-user-contract-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async uploadSalesContractFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-sales-contract-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    async uploadUserSignContractFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF, PDF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-user-sign-contract-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async uploadUserSignCoreContractFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF, PDF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-user-sign-core-contract-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async uploadPlanFinalContractFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF, PDF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-plan-final-contract-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async uploadCorePlanFinalContractFile(file, account, name = null) {
        // 檢查檔案類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('檔案類型不支援。僅支援 JPG, PNG, GIF, PDF 格式');
        }

        // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('檔案大小不能超過 10MB');
        }

        // 創建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', account);

        if (name) {
            formData.append('name', name);
        }

        // 上傳檔案
        return api.post('/f/private/file/upload-core-plan-final-contract-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }


}
