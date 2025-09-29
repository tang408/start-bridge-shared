<template>
  <div class="fs-24 ta-center mb-4">系統訊息通知</div>

  <div class="notifications">
    <article
        v-for="msg in messages"
        :key="msg.id"
        class="notify-card"
        :class="{ unread: !msg.read }"
        @click="handleNotifyClick(msg)"
    >
      <header class="notify-head">
        <span class="status-pill" :class="msg.type">{{ msg.typeLabel }}</span>
      </header>
      <p class="notify-body">{{ msg.text }}</p>
    </article>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useAuth} from "@/composables/useAuth.js";
import {notifyApi} from "@/api/modules/notify.js";
import {useNotifications} from "@/composables/useNotifications.js";

const {isLoggedIn, currentSales} = useAuth();
const { updateUnreadCounts, decreaseUnreadCount } = useNotifications('sales');

const messages = ref([]);

async function getSalesNotifies() {
  const formData = {
    salesId: currentSales.value
  }
  const response = await notifyApi.getSalesNotify(formData);
  console.log(response);

  if (response.code === 0 && response.data?.salesNotifyDatas) {
    const notifies = response.data.salesNotifyDatas;

    let founderUnread = 0;
    let cofounderUnread = 0;

    messages.value = notifies.map(notify => {
      const isFounder = notify.type === 1;
      const isUnread = notify.status === 1;

      // 計算未讀數量
      if (isUnread) {
        if (isFounder) founderUnread++;
        else cofounderUnread++;
      }

      return {
        id: notify.notifyId,
        type: isFounder ? 'founder' : 'cofounder',
        typeLabel: isFounder ? '創業者' : '共創者',
        text: notify.title,
        content: notify.content,
        planId: notify.planId,
        read: !isUnread,
      };
    });

    // 更新未讀數量
    updateUnreadCounts(founderUnread, cofounderUnread);
  }
}

async function handleNotifyClick(msg) {
  console.log('跳轉至專案:', msg.planId);
  console.log('通知類型:', msg.typeLabel);
  console.log('完整訊息:', msg);

  // 如果是未讀，標記為已讀
  if (!msg.read) {
    msg.read = true; // 先更新 UI

    try {
      const formData = {
        salesId: currentSales.value,
        notifyId: msg.id,
        status: 2
      }
      const response = await notifyApi.updateSalesNotify(formData);

      if (response.code === 0) {
        // 減少未讀數量
        decreaseUnreadCount(msg.type);
      } else {
        // API 失敗，還原狀態
        msg.read = false;
        console.error('更新通知狀態失敗:', response.message);
      }
    } catch (error) {
      msg.read = false;
      console.error('更新通知狀態失敗:', error);
    }
  }

  // TODO: 之後改成實際的路由跳轉
  // router.push({ name: 'ProjectDetail', params: { id: msg.planId } })
}
onMounted(() => {
  if (isLoggedIn.value) {
    getSalesNotifies();
  }
});
</script>

<style scoped lang="scss">
.notifications {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.notify-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }

  &.unread {
    background: #fffbf0;
    border-left: 4px solid #ffcc41;
  }
}

.notify-head {
  margin-bottom: 8px;
}

.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;

  &.founder {
    background: #ffcc41;
    color: #fff;
  }

  &.cofounder {
    background: #4a90e2;
    color: #fff;
  }
}

.notify-body {
  font-size: 15px;
  color: #333;
  margin: 0;
}
</style>
