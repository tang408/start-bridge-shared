// src/services/useAlert.ts
import { createApp, h, reactive } from 'vue';
import SharedMessageBox from "../components/shared/Shared-Message-Box.vue";

const alertState = reactive({
    isVisible: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm' | 'favorite',
    resolver: null as ((value: boolean | string) => void) | null, // ✅ 改為支援多種返回值
});

const container = document.createElement('div');
document.body.appendChild(container);

const alertApp = createApp({
    render() {
        return h(SharedMessageBox, {
            isVisible: alertState.isVisible,
            title: alertState.title,
            content: alertState.content,
            type: alertState.type,
            onClose: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver(true);
                    alertState.resolver = null;
                }
            },
            onCancel: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver(false);
                    alertState.resolver = null;
                }
            },
            // ✅ 新增 favorite 和 push 事件處理
            onFavorite: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver('favorite'); // 返回 'favorite' 字串
                    alertState.resolver = null;
                }
            },
            onPush: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver('push'); // 返回 'push' 字串
                    alertState.resolver = null;
                }
            }
        });
    }
});
alertApp.mount(container);

const AlertService = {
    /**
     * 顯示提示彈窗 (只有確認按鈕)
     */
    show(title: string, content: string): Promise<boolean> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.type = 'alert';
            alertState.isVisible = true;
            alertState.resolver = resolve as (value: boolean) => void;
        });
    },

    /**
     * 顯示確認彈窗 (有確認和取消按鈕)
     */
    confirm(title: string, content: string): Promise<boolean> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.type = 'confirm';
            alertState.isVisible = true;
            alertState.resolver = resolve as (value: boolean) => void;
        });
    },

    /**
     * ✅ 新增：顯示收藏彈窗 (有收藏和前往按鈕)
     * @returns 'favorite' | 'push' | false (關閉)
     */
    favorite(title: string, content: string): Promise<'favorite' | 'push' | false> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.type = 'favorite';
            alertState.isVisible = true;
            alertState.resolver = resolve as (value: 'favorite' | 'push' | false) => void;
        });
    },

    close(): void {
        alertState.isVisible = false;
    }
};

export const NewAlert = AlertService;
