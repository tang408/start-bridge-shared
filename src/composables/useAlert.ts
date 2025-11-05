// src/services/useAlert.ts
import { createApp, h, reactive } from 'vue';
import SharedMessageBox from "../components/shared/Shared-Message-Box.vue";

const alertState = reactive({
    isVisible: false,
    title: '',
    content: '',
    resolver: null as ((value: boolean) => void) | null,
});

const container = document.createElement('div');
document.body.appendChild(container);

const alertApp = createApp({
    render() {
        return h(SharedMessageBox, {
            isVisible: alertState.isVisible,
            title: alertState.title,
            content: alertState.content,
            onClose: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver(true);
                    alertState.resolver = null;
                }
            }
        });
    }
});
alertApp.mount(container);

const AlertService = {
    /**
     * 顯示彈窗 (支援 Promise)
     */
    show(title: string, content: string): Promise<boolean> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.isVisible = true;
            alertState.resolver = resolve;
        });
    },

    close(): void {
        alertState.isVisible = false;
    }
};

export const NewAlert = AlertService;
