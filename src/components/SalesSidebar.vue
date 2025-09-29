<template>
  <aside class="sidebar">
    <div class="sidebar-card">
      <div class="profile">
        <div class="avatar-img">
          <img class="avatar" :src="avatar" alt="avatar" />
          <img
            class="avatar-edit"
            src="@/assets/icon/avatar-edit.png"
            alt="avatar"
          />
        </div>
        <div>
          <div class="roles">
            <div>
              <span class="orange">{{ rank }}</span>
              {{ name }}
            </div>
            <div class="mt-2 mb-2 d-flex gap-2">
              系統訊息<span class="notice">{{ totalUnreadCount }}</span>
            </div>
            <div>當月業績：{{ salesPerformance }} 萬</div>
            <div>
              <span>創業者：{{ founderCount }}人</span> |
              <span>共創者：{{ coreFounderCount }}人</span>
            </div>
            <div>我的團隊：{{ teamMemberCount }}人</div>
            <div>推薦碼：{{ referralCode }}</div>
          </div>
        </div>
      </div>

      <nav class="menu">
        <button
          v-for="item in items"
          :key="item.key"
          class="menu-item"
          :class="{ active: $route.name === item.key }"
          @click="$emit('select', item)"
        >
          <div class="menu-item-content">
            <span class="label"
              >{{ item.label }}
              <span v-if="item.key === 'notifications' && totalUnreadCount > 0" class="notice">
                {{ totalUnreadCount }}
              </span>
            </span>
          </div>
        </button>
        <div class="justify-content-center d-flex">
          <hr class="w-70" />
        </div>
        <button class="menu-item" @click="$emit('reset_password')">
          <div class="menu-item-content">
            <span class="label">修改密碼 </span>
          </div>
        </button>

        <button class="menu-item" @click="$emit('logout')">
          <div class="menu-item-content">
            <span class="label">登出 </span>
          </div>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";
import avatarImg from "@/assets/images/avatar.png";
import { useNotifications } from '@/composables/useNotifications.js'

// 注意這裡是 'sales'
const { totalUnreadCount } = useNotifications('sales')
defineProps({
  avatar: { type: String, default: avatarImg },
  coreFounderCount: { type: Number, default: 0 },
  founderCount: { type: Number, default: 0 },
  name: { type: String, default: "業務名稱業務名稱" },
  notifyCount: { type: Number, default: 0 },
  rank: { type: String, default: "業務" },
  referralCode: { type: String, default: "ABCD1234" },
  salesPerformance: { type: Number, default: 0 },
  teamMemberCount: { type: Number, default: 0 },
});

defineEmits(["select", "logout", "reset_password"]);
useRoute();


const items = [
  { key: "member", label: "轄下會員列表" },
  { key: "sales", label: "轄下業務列表" },
  { key: "management", label: "專案管理系統" },
  { key: "notifications", label: "系統訊息通知" },
  { key: "bonus", label: "獎金明細" },
  { key: "records", label: "業績紀錄" },
  { key: "assessment", label: "考核" },
  { key: "chart", label: "組織圖" },
];
</script>

<style lang="scss" scoped>
.sidebar {
  width: 240px;
  @media (max-width: 576px) {
    width: 100%;
  }
  &-card {
    padding: 70px 0;
    min-height: 520px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    @media (min-width: 577px) {
      background: $card-bg;
      box-shadow: 4px 4px 20px #0000000d;
      border-radius: 30px;
      width: 250px;
    }
  }
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap-25;
  padding: 6px 0 10px;
  text-align: center;
  .avatar-img {
    position: relative;
  }

  .avatar {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    object-fit: cover;
    &-edit {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .roles {
    display: flex;
    align-items: start;
    justify-content: center;
    text-align: center;
    gap: $gap-5;
    flex-flow: column;
    font-weight: $fw-400;
    font-size: $fs-14;
    line-height: $lh-17;

    span {
      &.orange {
        color: $brand-orange;
        font-weight: $fw-600;
      }
    }
  }
}
</style>
