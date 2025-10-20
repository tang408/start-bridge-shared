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
            <span class="role">創業家</span><span class="sep">|</span
            ><span class="role">共創者</span>
          </div>
          <div class="name" :title="displayName">{{ displayName }}</div>
        </div>
      </div>

      <nav class="menu">
        <button
          v-for="item in items"
          :key="item.key"
          class="menu-item"
          :class="{ active: $route.name === item.key }"
          @click="$emit('select', item)"
          @mouseenter="hoveredKey = item.key"
          @mouseleave="hoveredKey = ''"
        >
          <div class="menu-item-content">
            <img class="icon" :src="getIcon(item)" :alt="item.label" />
            <span class="label"
              >{{ item.label }}
              <span v-if="item.key === 'email' && totalUnreadCount > 0" class="notice">
                {{ totalUnreadCount }}
              </span>
            </span>
          </div>
        </button>

        <div class="logout">
          <button class="logout-btn" @click="$emit('logout')">登出</button>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications.js';
import { ref } from "vue";
import side1 from "@/assets/icon/side-1.svg";
import side2 from "@/assets/icon/side-2.svg";
import side3 from "@/assets/icon/side-3.svg";
import side4 from "@/assets/icon/side-4.svg";
import side5 from "@/assets/icon/side-5.svg";
import side6 from "@/assets/icon/side-6.svg";
import side8 from "@/assets/icon/side-8.svg";
import side9 from "@/assets/icon/side-9.svg";
import side1Active from "@/assets/icon/side-1-active.svg";
import side2Active from "@/assets/icon/side-2-active.svg";
import side3Active from "@/assets/icon/side-3-active.svg";
import side4Active from "@/assets/icon/side-4-active.svg";
import side5Active from "@/assets/icon/side-5-active.svg";
import side6Active from "@/assets/icon/side-6-active.svg";
import side8Active from "@/assets/icon/side-8-active.svg";
import side9Active from "@/assets/icon/side-9-active.svg";
import avatarImg from "@/assets/images/avatar.png";

const { totalUnreadCount } = useNotifications('user');

defineProps({
  displayName: { type: String, default: "帳號名稱帳號名稱" },
  avatar: { type: String, default: avatarImg },
});
defineEmits(["select", "logout"]);
useRoute();

console.log(totalUnreadCount.value)
const items = [
  { key: "profile", label: "基本資料", icon: side1, iconActive: side1Active },
  {
    key: "email",
    label: "我的信箱",
    icon: side2,
    iconActive: side2Active,
    count: totalUnreadCount,
  },
  { key: "favorites", label: "我的收藏", icon: side3, iconActive: side3Active },
  {
    key: "participation",
    label: "參與專案管理",
    icon: side4,
    iconActive: side4Active,
  },
  {
    key: "startup",
    label: "創業計劃管理",
    icon: side5,
    iconActive: side5Active,
  },
  { key: "contracts", label: "公版合約", icon: side6, iconActive: side6Active },
  {
    key: "courses",
    label: "課程/講座報名",
    icon: side8,
    iconActive: side8Active,
  },
  { key: "faq", label: "幫助中心(FAQ)", icon: side9, iconActive: side9Active },
];

const route = useRoute();
const hoveredKey = ref("");
const getIcon = (item) => {
  if (route.name === item.key || hoveredKey.value === item.key) {
    return item.iconActive;
  }
  return item.icon;
};
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
    align-items: center;
    justify-content: center;
    text-align: center;
    color: $brand-orange;
    gap: $gap-2;

    span {
      font-weight: $fw-600;
      font-size: $fs-12;
      line-height: $lh-17;
    }

    .role {
      font-weight: $fw-700;
      letter-spacing: 0.02em;
    }
    .sep {
      opacity: 0.7;
    }
  }
  .name {
    font-weight: $fw-400;
    font-size: $fs-14;
    line-height: $lh-17;
    color: $text-dark;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.5rem;
  }
}

.logout {
  width: 100%;
  text-align: center;
  &-btn {
    margin-top: auto;
    align-self: flex-start;
    padding: 10px 12px;
    border: none;
    background: transparent;
    color: $text-dark;
    cursor: pointer;

    font-weight: $fw-400;
    font-size: $fs-16;
    line-height: $lh-19;
    letter-spacing: 0.04em;
    color: $text-dark;
  }
}
</style>
