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
            <!-- 顯示主要內容 -->
            <div class="main-content">{{ m.parsedContent.main }}</div>

            <!-- 如果有銀行資訊，以特殊格式顯示 -->
            <div v-if="m.parsedContent.bankInfo" class="bank-info">
              <div class="bank-info-item">
                <strong>銀行代碼：</strong>{{ m.parsedContent.bankInfo.code }}
              </div>
              <div class="bank-info-item">
                <strong>銀行帳號：</strong>{{ m.parsedContent.bankInfo.account }}
              </div>
              <div class="bank-info-item">
                <strong>戶名：</strong>{{ m.parsedContent.bankInfo.name }}
              </div>
            </div>
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
    messages: [],
    expandedId: null,
  },
  cofounder: {
    messages: [],
    expandedId: null,
  },
});

const current = computed(() => tabState[activeTab.value]);

// 解析內容，分離主要內容和銀行資訊
function parseContent(content) {
  const bankCodeRegex = /銀行代碼[:：]\s*[（(]?\s*(\d+)\s*[）)]?\s*([^\n]+)/;
  const bankAccountRegex = /銀行帳號[:：]\s*([^\n]+)/;
  const bankNameRegex = /戶名[:：]\s*([^\n]+)/;

  const codeMatch = content.match(bankCodeRegex);
  const accountMatch = content.match(bankAccountRegex);
  const nameMatch = content.match(bankNameRegex);

  if (codeMatch && accountMatch && nameMatch) {
    // 有銀行資訊，分離主要內容
    let mainContent = content;

    // 移除銀行資訊部分
    mainContent = mainContent.replace(/銀行代碼[:：][^\n]+\n?/g, '');
    mainContent = mainContent.replace(/銀行帳號[:：][^\n]+\n?/g, '');
    mainContent = mainContent.replace(/戶名[:：][^\n]+\n?/g, '');
    mainContent = mainContent.trim();

    return {
      main: mainContent,
      bankInfo: {
        code: `${codeMatch[1]} ${codeMatch[2]}`.trim(),
        account: accountMatch[1].trim(),
        name: nameMatch[1].trim()
      }
    };
  }

  // 沒有銀行資訊，返回原始內容
  return {
    main: content,
    bankInfo: null
  };
}

async function toggleCard(id) {
  current.value.expandedId = current.value.expandedId === id ? null : id;

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
      if (m) m.favorite = !val;
      console.error('更新收藏失敗:', response.message);
    }
  } catch (error) {
    if (m) m.favorite = !val;
    console.error('更新收藏失敗:', error);
  }
}

async function removeMsg(id) {
  const list = current.value.messages;
  const idx = list.findIndex((x) => x.id === id);

  if (idx === -1) return;

  const removedMsg = list[idx];

  list.splice(idx, 1);
  if (current.value.expandedId === id) {
    current.value.expandedId = null;
  }

  try {
    const formData = {
      userId: currentUser.value,
      notifyId: id
    }
    const response = await notifyApi.deleteUserNotify(formData);

    if (response.code === 0) {
      console.log('訊息刪除成功');
    } else {
      list.splice(idx, 0, removedMsg);
      console.error('刪除失敗:', response.message);
    }
  } catch (error) {
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

  if (response.code === 0 && response.data?.userNotifyDatas) {
    const notifies = response.data.userNotifyDatas;

    tabState.founder.messages = [];
    tabState.cofounder.messages = [];

    let founderUnread = 0;
    let cofounderUnread = 0;

    notifies.forEach(notify => {
      const message = {
        id: notify.notifyId,
        title: notify.title,
        content: notify.content,
        parsedContent: parseContent(notify.content), // 解析內容
        read: notify.status !== 1,
        tagged: false,
        favorite: notify.favorite
      };

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
  background: transparent;
  border-radius: 20px;
  border: 1px solid #dfdfdf;

  &.is-fav {
    border-color: #ffcc41;
  }

  &.unread {
    background: #fff9e6;
    border-left: 4px solid #ffcc41;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  &.unread.is-fav {
    box-shadow: 0 0 0 3px #ffcc4140 inset, 0 2px 10px #0000000f;
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
      .main-content {
        margin-bottom: 16px;
        color: #4b4f4a;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        white-space: pre-line;
      }

      .bank-info {
        border-radius: 12px;
        padding: 16px;
        margin-top: 16px;

        .bank-info-item {
          color: #333;
          font-size: 16px;
          line-height: 28px;
          font-weight: 500;

          strong {
            font-weight: 700;
            margin-right: 8px;
          }

          &:not(:last-child) {
            margin-bottom: 8px;
          }
        }
      }
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
