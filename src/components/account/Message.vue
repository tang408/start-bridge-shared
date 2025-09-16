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
          />
        </div>
      </transition>
    </article>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";

const activeTab = ref("founder");

const tabState = reactive({
  founder: {
    messages: [
      {
        id: 1,
        title: "xx品牌專案，已刊登上架，等待媒合進度",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        read: true,
        tagged: true,
        favorite: true,
      },
      {
        id: 2,
        title: "未讀文件-已展開-已標籤",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        read: false,
        tagged: true,
        favorite: false,
      },
      {
        id: 3,
        title: "已讀文件-無標籤",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        read: true,
        tagged: false,
        favorite: false,
      },
      {
        id: 4,
        title: "已讀文件-已標籤",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        read: true,
        tagged: true,
        favorite: true,
      },
    ],
    expandedId: 1,
  },
  cofounder: {
    messages: [
      {
        id: 1,
        title: "（共創者）xx品牌專案…",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        read: true,
        tagged: false,
        favorite: false,
      },
      {
        id: 2,
        title: "（共創者）未讀文件…",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        read: false,
        tagged: true,
        favorite: true,
      },
    ],
    expandedId: null,
  },
});

const current = computed(() => tabState[activeTab.value]);

function toggleCard(id) {
  current.value.expandedId = current.value.expandedId === id ? null : id;
}

function setFavorite(id, val) {
  const m = current.value.messages.find((x) => x.id === id);
  if (m) m.favorite = val;
}

function removeMsg(id) {
  const list = current.value.messages;
  const idx = list.findIndex((x) => x.id === id);
  if (idx > -1) list.splice(idx, 1);
  if (current.value.expandedId === id) current.value.expandedId = null;
}
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
