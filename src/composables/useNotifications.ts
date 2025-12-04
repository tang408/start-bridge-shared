import { ref, computed } from 'vue';
import {notifyApi} from "../api/modules/notify";

// User (創業者/共創者) 的未讀數量
const userFounderUnreadCount = ref(0);
const userCofounderUnreadCount = ref(0);

// Sales (業務) 的未讀數量
const salesFounderUnreadCount = ref(0);
const salesCofounderUnreadCount = ref(0);

export function useNotifications(type = 'user', role = 'founder') {
    // 根據類型和角色選擇對應的 ref
    const getUnreadCountRef = () => {
        if (type === 'sales') {
            return role === 'founder' ? salesFounderUnreadCount : salesCofounderUnreadCount;
        } else {
            return role === 'founder' ? userFounderUnreadCount : userCofounderUnreadCount;
        }
    };

    const unreadCount = getUnreadCountRef();

    // 獲取所有相關的未讀數量（用於顯示總數）
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

    // 更新當前角色的未讀數量
    function updateUnreadCount(count) {
        unreadCount.value = count;
    }

    // 更新所有未讀數量（初始載入時使用）
    function updateUnreadCounts(founderCount, cofounderCount) {
        founderUnreadCount.value = founderCount;
        cofounderUnreadCount.value = cofounderCount;
    }

    // 減少當前角色的未讀數量
    function decreaseUnreadCount(count = 1) {
        unreadCount.value = Math.max(0, unreadCount.value - count);
    }

    // 增加當前角色的未讀數量
    function increaseUnreadCount(count = 1) {
        unreadCount.value += count;
    }

    // 重置當前角色的未讀數量
    function resetUnreadCount() {
        unreadCount.value = 0;
    }

    // 重置所有未讀數量
    function resetUnreadCounts() {
        founderUnreadCount.value = 0;
        cofounderUnreadCount.value = 0;
    }

    // 初始化當前角色的未讀數量
    async function initUnreadCount(userId) {
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
                    const targetType = role === 'founder' ? 1 : 2;
                    const unread = notifies.filter(
                        notify => notify.status === 1 && notify.type === targetType
                    ).length;

                    updateUnreadCount(unread);
                }
            }
        } catch (error) {
            console.error('初始化未讀數量失敗:', error);
        }
    }

    // 初始化所有角色的未讀數量
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
                            else if (notify.type === 2) cofounderUnread++;
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
        // 當前角色的未讀數量
        unreadCount,

        // 所有角色的未讀數量（用於顯示總數或分別顯示）
        founderUnreadCount,
        cofounderUnreadCount,
        totalUnreadCount,

        // 更新方法
        updateUnreadCount,      // 更新當前角色
        updateUnreadCounts,     // 更新所有角色

        // 操作方法
        decreaseUnreadCount,    // 減少當前角色
        increaseUnreadCount,    // 增加當前角色
        resetUnreadCount,       // 重置當前角色
        resetUnreadCounts,      // 重置所有角色

        // 初始化方法
        initUnreadCount,        // 初始化當前角色
        initUnreadCounts        // 初始化所有角色
    };
}
