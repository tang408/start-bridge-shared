import { ref, computed } from 'vue';
import {notifyApi} from "../api/modules/notify";

// User (創業者/共創者) 的未讀數量
const userFounderUnreadCount = ref(0);
const userCofounderUnreadCount = ref(0);

// Sales (業務) 的未讀數量
const salesFounderUnreadCount = ref(0);
const salesCofounderUnreadCount = ref(0);

export function useNotifications(type = 'user') {
    // 根據類型選擇對應的 ref
    const founderUnreadCount = type === 'sales'
        ? salesFounderUnreadCount
        : userFounderUnreadCount;

    const cofounderUnreadCount = type === 'sales'
        ? salesCofounderUnreadCount
        : userCofounderUnreadCount;

    // 計算總未讀數量
    const totalUnreadCount = computed(() =>
        founderUnreadCount.value + cofounderUnreadCount.value
    );

    // 更新未讀數量（初始載入時使用）
    function updateUnreadCounts(founderCount, cofounderCount) {
        founderUnreadCount.value = founderCount;
        cofounderUnreadCount.value = cofounderCount;
    }

    // 減少未讀數量（標記已讀或刪除時使用）
    function decreaseUnreadCount(notifyType) {
        if (notifyType === 1 || notifyType === 'founder') {
            founderUnreadCount.value = Math.max(0, founderUnreadCount.value - 1);
        } else if (notifyType === 2 || notifyType === 'cofounder') {
            cofounderUnreadCount.value = Math.max(0, cofounderUnreadCount.value - 1);
        }
    }

    // 增加未讀數量（如果需要）
    function increaseUnreadCount(notifyType) {
        if (notifyType === 1 || notifyType === 'founder') {
            founderUnreadCount.value++;
        } else if (notifyType === 2 || notifyType === 'cofounder') {
            cofounderUnreadCount.value++;
        }
    }

    // 重置未讀數量
    function resetUnreadCounts() {
        founderUnreadCount.value = 0;
        cofounderUnreadCount.value = 0;
    }

    // 新增：初始化未讀數量
    async function initUnreadCounts(userId) {
        try {
            const formData = type === 'sales'
                ? { salesId: userId }
                : { userId: userId };

            const response = type === 'sales'
                ? await notifyApi.getSalesNotify(formData)
                : await notifyApi.getUserNotifies(formData);

            if (response.code === 0) {
                const notifies = type === 'sales'
                    ? response.data?.salesNotifyDatas
                    : response.data?.userNotifyDatas;

                if (notifies) {
                    let founderUnread = 0;
                    let cofounderUnread = 0;

                    notifies.forEach(notify => {
                        if (notify.status === 1) { // 未讀
                            if (notify.type === 1) founderUnread++;
                            else cofounderUnread++;
                        }
                    });

                    updateUnreadCounts(founderUnread, cofounderUnread);
                }
            }
        } catch (error) {
            console.error('初始化未讀數量失敗:', error);
        }
    }

    return {
        founderUnreadCount,
        cofounderUnreadCount,
        totalUnreadCount,
        updateUnreadCounts,
        decreaseUnreadCount,
        increaseUnreadCount,
        resetUnreadCounts,
        initUnreadCounts
    };
}
