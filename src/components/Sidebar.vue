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
        >
          <div class="menu-item-content">
            <span
              class="icon-mask"
              :style="{ '--icon-url': `url(${item.icon})` }"
              :aria-label="item.label"
            ></span>
            <span class="label"
              >{{ item.label }}
              <span
                v-if="item.key === 'inbox' && item.count > 0"
                class="notice"
                >{{ item.count }}</span
              >
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
import { useRoute } from "vue-router";
import side1 from "@/assets/icon/side-1.png";
import side2 from "@/assets/icon/side-2.png";
import side3 from "@/assets/icon/side-3.png";
import side4 from "@/assets/icon/side-4.png";
import side5 from "@/assets/icon/side-5.png";
import side6 from "@/assets/icon/side-6.png";
import side7 from "@/assets/icon/side-7.png";
import side8 from "@/assets/icon/side-8.png";
import side9 from "@/assets/icon/side-9.png";
import avatarImg from "@/assets/images/avatar.png";

defineProps({
  displayName: { type: String, default: "帳號名稱帳號名稱" },
  avatar: { type: String, default: avatarImg },
});
defineEmits(["select", "logout"]);
useRoute();

const items = [
  { key: "profile", label: "基本資料", icon: side1 },
  { key: "inbox", label: "我的信箱", icon: side2, count: 1 },
  { key: "favorites", label: "我的收藏", icon: side3 },
  { key: "participation", label: "參與專案管理", icon: side4 },
  { key: "startup", label: "創業計劃管理", icon: side5 },
  { key: "contracts", label: "公告合約", icon: side6 },
  { key: "bookings", label: "預約活動及記錄", icon: side7 },
  { key: "courses", label: "課程/講座報名", icon: side8 },
  { key: "faq", label: "幫助中心(FAQ)", icon: side9 },
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

.menu {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: $gap-4;
  overflow-y: auto;
  &-item {
    position: relative;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: $text-dark;
    font-size: 14px;
    text-align: left;
    transition: background 0.2s ease, color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    span {
      font-weight: 400;
      font-size: 18px;
      line-height: 22px;
    }

    &.active,
    &:hover {
      background: $sidebar-gradient;
      border-right: 5px solid #ff6634;
      .icon {
        color: $btn-orange;
      }

      &::before {
        content: "";
        position: absolute;
        left: -16px;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #ff8a3d 0%, #ff6634 100%);
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
      .icon-mask {
        color: $btn-orange;
      }

      .menu-item-content .label {
        color: $btn-orange;
      }
    }

    &-content {
      width: 82%;
      gap: $gap-8;
      display: flex;
      align-items: center;
      padding: 16px;

      .label {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        .notice {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: $btn-orange;
          color: $white;
          font-size: 14px;
          font-weight: 400;
          line-height: 17px;
          text-align: center;
          margin-bottom: -3px;
        }
      }
    }

    .icon {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $text-dark;
      &-mask {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        background-color: currentColor;
        -webkit-mask-image: var(--icon-url);
        mask-image: var(--icon-url);
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-size: contain;
        mask-size: contain;
      }
    }
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

    &:hover {
      color: $btn-orange;
    }
  }
}
</style>
