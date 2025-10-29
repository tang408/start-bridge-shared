<template>
  <div class="fs-24 ta-center mb-4">系統訊息通知</div>

  <div class="notifications">
    <article
        v-for="msg in messages"
        :key="msg.id"
        class="notify-card"
        :class="[
      { expanded: expandedId === msg.id },
      { unread: !msg.read }
    ]"
    >
      <button
          class="notify-summary"
          type="button"
          @click="toggleCard(msg.id)"
      >
        <header class="notify-head">
          <span class="status-pill" :class="msg.type">{{ msg.typeLabel }}</span>
        </header>
        <p class="notify-body">{{ msg.text }}</p>
      </button>

      <transition name="msg">
        <div
            v-show="expandedId === msg.id"
            class="notify-details"
        >
          <div class="notify-content">
            {{ msg.content || msg.text }}
          </div>

          <SharedFabActions
              :favorite="msg.favorite"
              iconType="star"
              :showTrash="true"
              :showPush="true"
              size="md"
              @favorite-toggle="(val) => setFavorite(msg.id, val)"
              @remove="removeMsg(msg.id)"
              @push="handlePush(msg.planId)"
              :right="16"
              :bottom="16"
          />
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
        favorite: notify.favorite || false, // 新增這行
      };
    });

    // 更新未讀數量
    updateUnreadCounts(founderUnread, cofounderUnread);
  }
}

// 新增 toggleCard 函數
async function toggleCard(id) {
  // 切換展開/收合
  expandedId.value = expandedId.value === id ? null : id;

  // 如果是收起卡片,直接返回
  if (expandedId.value === null) {
    return;
  }

  // 如果是展開卡片,標記為已讀
  const msg = messages.value.find(m => m.id === id);
  if (!msg || msg.read) {
    return;
  }

  // 先更新 UI
  msg.read = true;

  try {
    const formData = {
      salesId: currentSales.value,
      notifyId: id,
      status: 2
    }
    const response = await notifyApi.updateSalesNotify(formData);

    if (response.code === 0) {
      // 減少未讀數量
      const notifyType = msg.type === 'founder' ? 1 : 2;
      decreaseUnreadCount(notifyType);
    } else {
      // API 失敗,還原狀態
      msg.read = false;
      console.error('更新通知狀態失敗:', response.message);
    }
  } catch (error) {
    msg.read = false;
    console.error('更新通知狀態失敗:', error);
  }
}

// 新增 setFavorite 函數
async function setFavorite(id, val) {
  const msg = messages.value.find(m => m.id === id);
  if (msg) msg.favorite = val;

  try {
    const formData = {
      salesId: currentSales.value,
      notifyId: id,
      favorite: val
    }

    const response = await notifyApi.updateSalesNotify(formData);

    if (response.code !== 0) {
      // API 失敗時,還原本地狀態
      if (msg) msg.favorite = !val;
      console.error('更新收藏失敗:', response.message);
    }
  } catch (error) {
    // 發生錯誤時,還原本地狀態
    if (msg) msg.favorite = !val;
    console.error('更新收藏失敗:', error);
  }
}

// 新增 removeMsg 函數
async function removeMsg(id) {
  const idx = messages.value.findIndex(m => m.id === id);
  if (idx === -1) return;

  // 暫存要刪除的訊息
  const removedMsg = messages.value[idx];

  // 立即從 UI 移除
  messages.value.splice(idx, 1);
  if (expandedId.value === id) {
    expandedId.value = null;
  }

  // 呼叫 API 刪除
  try {
    const formData = {
      salesId: currentSales.value,
      notifyId: id
    }
    const response = await notifyApi.deleteSalesNotify(formData);

    if (response.code === 0) {
      console.log('訊息刪除成功');
    } else {
      // API 失敗,還原訊息
      messages.value.splice(idx, 0, removedMsg);
      console.error('刪除失敗:', response.message);
    }
  } catch (error) {
    // 發生錯誤,還原訊息
    messages.value.splice(idx, 0, removedMsg);
    console.error('刪除失敗:', error);
  }
}

async function handlePush(planId) {
  router.push({
    name: 'management',
    query: {
      planId: planId,
      autoOpen: 'true'
    }
  });
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
  position: relative; // 新增這行,讓 FAB 按鈕可以定位
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  padding: 14px 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  border: 2px solid transparent; // 新增這行

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &.unread {
    background: #fffbf0;
    border-left: 4px solid #ffcc41;
  }

  // 新增收藏樣式
  &.is-fav {
    border-color: #ffcc41;
  }

  &.unread.is-fav {
    box-shadow: 0 0 0 3px #ffcc4140 inset, 0 2px 10px #0000000f;
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

.notify-summary {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.notify-details {
  padding: 0 0 140px; // 調整 padding,為 FAB 按鈕留空間
}

.notify-content {
  margin: 16px 0;
  color: #4b4f4a;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}

.msg-enter-from,
.msg-leave-to {
  height: 0;
  opacity: 0;
}

.msg-enter-active,
.msg-leave-active {
  transition: all 0.18s ease;
}
</style>
