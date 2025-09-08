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
            id: 0
        };
        const finalParams = { ...defaultParams, ...params };
        if (typeof finalParams.id !== 'number' || finalParams.id <= 0) {
            throw new Error('請提供有效的檔案 ID');
        }

        return api.post('/f/public/file/delete-proof-file', finalParams)
    }
}
