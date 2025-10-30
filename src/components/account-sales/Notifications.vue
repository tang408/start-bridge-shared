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
import {onMounted, ref} from "vue";
import {useAuth} from "@/composables/useAuth.js";
import {notifyApi} from "@/api/modules/notify.js";
import {useNotifications} from "@/composables/useNotifications.js";
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";
import {useRouter} from "vue-router";

const {isLoggedIn, currentSales} = useAuth();
const { updateUnreadCounts, decreaseUnreadCount } = useNotifications('sales');
const router = useRouter();

const messages = ref([]);
const expandedId = ref(null); // 新增這行

async function getSalesNotifies() {
  const formData = {
    salesId: currentSales.value
  }
  const response = await notifyApi.getSalesNotify(formData);
  console.log(response);

const notifications = ref([
  {
    id: 1,
    type: "new",
    typeLabel: "創業者",
    title: "Duis aute irure dolor in reprehenderit in?",
    text: "您的創業者專案已成功送出申請，系統將於 3 個工作天內完成審核。",
    read: false,
  },
  {
    id: 2,
    type: "new",
    typeLabel: "創業者",
    title: "Duis aute irure dolor in reprehenderit in?",
    text: "您的共創媒合已完成，請前往專案頁面確認詳細資料與後續步驟。",
    read: true,
  },
  {
    id: 3,
    type: "new",
    typeLabel: "創業者",
    title: "Duis aute irure dolor in reprehenderit in?",
    text: "星橋平台將於 11/1 進行系統維護，期間部分功能暫時無法使用。",
    read: false,
  },
]);

const expandedId = ref(null);

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id;
  const n = notifications.value.find((x) => x.id === id);
  if (n) n.read = true;
}
}
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

      &.new {
        background: #ffcc41;
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
