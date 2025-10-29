<template>
  <div class="fs-24">訊息</div>
  <SharedTabs
    v-model="activeTab"
    :tabs="[
      { label: '創業者資料', value: 'founder' },
      { label: '共創者資料', value: 'cofounder' },
    ]"
  />

  <div class="stack gap-3">
    <article
      v-for="m in current.messages"
      :key="m.id"
      class="msg-card"
      :class="[
        { expanded: current.expandedId === m.id },
        { unread: !m.read },
        { tagged: m.tagged },
        { 'is-fav': m.favorite },
      ]"
    >
      <button
        class="msg-header"
        type="button"
        @click="toggleCard(m.id)"
        :aria-expanded="current.expandedId === m.id ? 'true' : 'false'"
        :aria-controls="`panel-${m.id}`"
      >
        <span class="msg-title">{{ m.title }}</span>
      </button>

      <transition name="msg">
        <div
          v-show="current.expandedId === m.id"
          class="msg-body"
          :id="`panel-${m.id}`"
          role="region"
        >
          <div class="msg-content">
            {{ m.content }}
          </div>

          <SharedFabActions
            :favorite="m.favorite"
            iconType="star"
            :showTrash="true"
            size="md"
            @favorite-toggle="(val) => setFavorite(m.id, val)"
            @remove="removeMsg(m.id)"
            :right="16"
            :bottom="16"
          />
        </div>
      </transition>
    </article>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";
import {notifyApi} from "@/api/modules/notify.js";
import {useAuth} from "@/composables/useAuth.js";
import { useNotifications } from '@/composables/useNotifications.ts';

const { updateUnreadCounts, decreaseUnreadCount } = useNotifications('user');

const {isLoggedIn, currentUser} = useAuth();

const activeTab = ref("founder");

const tabState = reactive({
  founder: {
    messages: [

    ],
    expandedId: 1,
  },
  cofounder: {
    messages: [

    ],
    expandedId: null,
  },
});

const current = computed(() => tabState[activeTab.value]);

async function toggleCard(id) {
  current.value.expandedId = current.value.expandedId === id ? null : id;

  // 如果是收起卡片，直接返回
  if (current.value.expandedId === null) {
    return;
  }

  const m = current.value.messages.find((x) => x.id === id);
  if (!m || m.read) {
    return;
  }

  try {
    const formData = {
      userId: currentUser.value,
      notifyId: id,
      status: 2
    }

    const response = await notifyApi.updateUserNotify(formData);

    if (response.code === 0) {
      m.read = true;
      const notifyType = activeTab.value === 'founder' ? 1 : 2;
      decreaseUnreadCount(notifyType);

    } else {
      console.error('更新通知狀態失敗:', response.message);
    }
  } catch (error) {
    console.error('更新通知狀態失敗:', error);
  }
}

async function setFavorite(id, val) {
  console.log(id, val)

  const m = current.value.messages.find((x) => x.id === id);
  if (m) m.favorite = val;

  try {
    const formData = {
      userId: currentUser.value,
      notifyId: id,
      favorite: val
    }

    const response = await notifyApi.updateUserNotify(formData);

    if (response.code !== 0) {
      // API 失敗時，還原本地狀態
      if (m) m.favorite = !val;
      console.error('更新收藏失敗:', response.message);
    }
  } catch (error) {
    // 發生錯誤時，還原本地狀態
    if (m) m.favorite = !val;
    console.error('更新收藏失敗:', error);
  }
}

async function removeMsg(id) {
  // 先更新本地 UI
  const list = current.value.messages;
  const idx = list.findIndex((x) => x.id === id);

  if (idx === -1) return; // 找不到訊息，直接返回

  // 暫存要刪除的訊息（以便失敗時還原）
  const removedMsg = list[idx];

  // 立即從 UI 移除
  list.splice(idx, 1);
  if (current.value.expandedId === id) {
    current.value.expandedId = null;
  }

  // 呼叫 API 刪除
  try {
    const formData = {
      userId: currentUser.value,
      notifyId: id
    }
    const response = await notifyApi.deleteUserNotify(formData);

    if (response.code === 0) {
      console.log('訊息刪除成功');
    } else {
      // API 失敗，還原訊息
      list.splice(idx, 0, removedMsg);
      console.error('刪除失敗:', response.message);
    }
  } catch (error) {
    // 發生錯誤，還原訊息
    list.splice(idx, 0, removedMsg);
    console.error('刪除失敗:', error);
  }
}

const userNotifies = ref([]);

async function getUserNotifies() {
  const formData = {
    userId: currentUser.value
  }
  const response = await notifyApi.getUserNotifies(formData);
  userNotifies.value = response.data;

  // 將 API 資料寫入 tabState
  if (response.code === 0 && response.data?.userNotifyDatas) {
    const notifies = response.data.userNotifyDatas;

    // 清空現有資料
    tabState.founder.messages = [];
    tabState.cofounder.messages = [];

    let founderUnread = 0;
    let cofounderUnread = 0;

    // 根據 type 分類資料
    notifies.forEach(notify => {
      const message = {
        id: notify.notifyId,
        title: notify.title,
        content: notify.content,
        read: notify.status !== 1,
        tagged: false, // API 資料中沒有這個欄位，可以根據需求調整
        favorite: notify.favorite
      };

      console.log(notifies)

      if (notify.type === 1) {
        tabState.founder.messages.push(message);
      } else if (notify.type === 2) {
        tabState.cofounder.messages.push(message);
      }
      if (notify.status === 1) {
        if (notify.type === 1) founderUnread++;
        else cofounderUnread++;
      }
    });

    updateUnreadCounts(founderUnread, cofounderUnread);


    // 重置展開狀態
    tabState.founder.expandedId = null;
    tabState.cofounder.expandedId = null;
  }
}
onMounted(() => {
  if (isLoggedIn.value) {
    getUserNotifies();
  }
})


</script>

<style lang="scss" scoped>
.stack {
  display: grid;
  gap: 20px;
  width: 100%;
}

.msg-card {
  position: relative;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  background: #ffffff80;
  box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  border: 2px solid transparent;

  &.is-fav {
    border-color: #ffcc41;
  }

  &.unread.is-fav {
    box-shadow: 0 0 0 3px #ffcc4140 inset, 0 2px 10px #0000000f;
  }
  &.unread {
    background: #fff9e6; // 淺黃背景
    border-left: 4px solid #ffcc41; // 左側黃條

  }

  .msg-header {
    width: 100%;
    text-align: left;
    background: transparent;
    border: 0;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    .msg-title {
      margin: 0;
      color: #373a36;
    }
  }

  .msg-body {
    padding: 0 24px 140px;

    .msg-content {
      margin: 0;
      color: #4b4f4a;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
    }
  }

  .msg-actions {
    position: absolute;
    right: 16px;
    bottom: 16px;
    display: flex;
    gap: 12px;
  }

  .circle-btn {
    inline-size: 56px;
    block-size: 56px;
    border-radius: 50%;
    border: 0;
    background: #ffe07a;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    transition: transform 0.08s ease, filter 0.15s ease;

    &:active {
      transform: translateY(1px) scale(0.98);
    }
    &:hover {
      filter: brightness(0.98);
    }

    &.favorite[aria-pressed="true"] {
      background: #ffcc41;
    }
    &.danger {
      background: #f2f2f2;
    }

    .icon {
      inline-size: 24px;
      block-size: 24px;
      background: #333;
      mask-position: center;
      mask-size: contain;
      mask-repeat: no-repeat;
    }
    .icon-star {
      mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23000" d="m12 17.27l-6.18 3.73l1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62L22 9.24l-5.46 4.73l1.64 7.03z"/></svg>');
    }
    .icon-trash {
      mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23000" d="M9 3h6v2h5v2H4V5h5zm1 6h2v9h-2zm4 0h2v9h-2z"/></svg>');
    }
  }
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
