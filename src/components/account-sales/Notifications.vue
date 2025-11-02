<template>
  <div class="fs-24 ta-center mb-4">系統訊息通知</div>

  <div class="notifications">
    <article
        v-for="n in notifications"
        :key="n.id"
        class="notify-card"
        :class="[{ expanded: expandedId === n.id }, { unread: !n.read }]"
    >
      <button
          class="notify-header"
          type="button"
          @click="toggle(n.id)"
          :aria-expanded="expandedId === n.id ? 'true' : 'false'"
          :aria-controls="`panel-${n.id}`"
      >
        <div>
          <span class="status-pill" :class="n.type">{{ n.typeLabel }}</span>
        </div>
        <span class="notify-title">{{ n.title }}</span>
      </button>

      <transition name="notify">
        <div
            v-show="expandedId === n.id"
            class="notify-body"
            :id="`panel-${n.id}`"
            role="region"
        >
          <p class="notify-content">{{ n.text }}</p>
        </div>
      </transition>
    </article>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth.js";
import { notifyApi } from "@/api/modules/notify.js";
import { useNotifications } from "@/composables/useNotifications.js";
import { useRouter } from "vue-router";

const { isLoggedIn, currentSales } = useAuth();
const { decreaseUnreadCount } = useNotifications('sales');
const router = useRouter();

const notifications = ref([]);
const expandedId = ref(null);

// 將 API 資料轉換為前端格式
function transformNotifyData(apiData) {
  return apiData.map(item => ({
    id: item.notifyId,
    type: item.type === 1 ? 'founder' : 'cofounder', // 根據 type 設定類型
    typeLabel: item.type === 1 ? '創業者' : '共創者',
    title: item.title,
    text: item.content || item.text, // API 可能用 content 欄位
    read: item.status === 2, // status: 1=未讀, 2=已讀
    notifyType: item.type // 保存原始 type 用於更新未讀數
  }));
}

async function getSalesNotifies() {
  try {
    const formData = {
      salesId: currentSales.value
    };

    const response = await notifyApi.getSalesNotify(formData);
    console.log('API Response:', response);

    if (response.code === 0 && response.data?.salesNotifyDatas) {
      // 轉換 API 資料
      notifications.value = transformNotifyData(response.data.salesNotifyDatas);
    } else {
      console.error('獲取通知失敗:', response.msg);
    }
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error);
  }
}

// 切換展開狀態並標記為已讀
async function toggle(id) {
  // 切換展開/收起
  expandedId.value = expandedId.value === id ? null : id;

  // 找到對應的通知
  const notification = notifications.value.find((x) => x.id === id);

  if (notification && !notification.read) {
    // 標記為已讀
    notification.read = true;

    // 減少未讀數量
    decreaseUnreadCount(notification.notifyType);

    // 可選：呼叫 API 更新後端的已讀狀態
    try {
      await notifyApi.updateSalesNotify({ notifyId: id, status: 2 }); // 根據你的 API 調整
    } catch (error) {
      console.error('標記已讀失敗:', error);
    }
  }
}

onMounted(() => {
  if (isLoggedIn.value && currentSales.value) {
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
  position: relative;
  transition: all 0.15s ease;
  background: transparent;
  border-radius: 14px;
  border: 1px solid #dfdfdf;

  &.unread {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  // 新增這個區塊
  &:not(.expanded) .notify-body {
    display: none;
  }

  .notify-header {
    width: 100%;
    background: transparent;
    border: 0;
    text-align: left;
    display: grid;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 16px;

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

    .notify-title {
      font-size: 15px;
      color: #373a36;
      font-weight: 600;
    }
  }

  .notify-body {
    padding: 0 16px 16px;

    .notify-content {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #555555;
    }
  }
}

.notify-enter-from,
.notify-leave-to {
  height: 0;
  opacity: 0;
}
.notify-enter-active,
.notify-leave-active {
  transition: all 0.18s ease;
}
</style>
