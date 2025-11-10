// src/services/useAlert.ts
import { createApp, h, reactive } from 'vue';
import SharedMessageBox from "../components/shared/Shared-Message-Box.vue";

type AlertType = 'alert' | 'confirm' | 'favorite';
type AlertResult = boolean | 'favorite' | 'push';

const alertState = reactive<{
    isVisible: boolean;
    title: string;
    content: string;
    type: AlertType;
    resolver: ((value: AlertResult) => void) | null;
}>({
    isVisible: false,
    title: '',
    content: '',
    type: 'alert',
    resolver: null,
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
            onFavorite: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver('favorite');
                    alertState.resolver = null;
                }
            },
            onPush: () => {
                alertState.isVisible = false;
                if (alertState.resolver) {
                    alertState.resolver('push');
                    alertState.resolver = null;
                }
            }
        });
    }
});
alertApp.mount(container);

const AlertService = {
    show(title: string, content: string): Promise<boolean> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.type = 'alert';
            alertState.isVisible = true;
            alertState.resolver = (value) => {
                resolve(Boolean(value));
            };
        });
    },

    confirm(title: string, content: string): Promise<boolean> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.type = 'confirm';
            alertState.isVisible = true;
            alertState.resolver = (value) => {
                resolve(Boolean(value));
            };
        });
    },

    favorite(title: string, content: string): Promise<'favorite' | 'push' | false> {
        return new Promise((resolve) => {
            alertState.title = title;
            alertState.content = content;
            alertState.type = 'favorite';
            alertState.isVisible = true;
            alertState.resolver = (value) => {
                if (value === 'favorite' || value === 'push') {
                    resolve(value);
                } else {
                    resolve(false);
                }
            };
        });
    },

    close(): void {
        alertState.isVisible = false;
    }
};

export const NewAlert = AlertService;
