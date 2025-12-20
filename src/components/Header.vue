<template>
  <div class="w-100">
    <div class="container">
      <nav class="navbar navbar-expand-lg">
        <router-link class="navbar-brand logo" to="/">
          <img :src="logoUrl" alt="Logo" height="32" />
        </router-link>
        <div class="d-flex">
          <button
              class="navbar-toggler"
              type="button"
              @click.stop="toggleMenu"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <button
              v-if="isAccountPage"
              class="user-toggler d-lg-none"
              type="button"
              aria-label="open account user page"
              @click.stop="toggleMobileSidebar"
          >
            <img src="@/assets/icon/user.png" alt="user" />
          </button>
        </div>

        <div :class="['navbar-collapse', { open: isMenuOpen }]" id="navbarNav">
          <ul class="navbar-nav ms-auto mt-1 mb-3 mb-lg-0">
            <li
                class="nav-item"
                :class="{
                'has-children': item.children,
                active: isActive(item),
              }"
                v-for="(item, index) in navItems"
                :key="index"
            >
              <router-link
                  v-if="!item.children"
                  class="nav-link d-flex align-items-center justify-content-between"
                  :to="item.link"
                  @click="handleLinkClick"
              >
                <div class="d-flex align-items-center gap-1">
                  <img src="@/assets/icon/menu-icon.svg" />
                  {{ item.label }}
                </div>
              </router-link>

              <div
                  v-else
                  class="d-flex align-items-center justify-content-between"
              >
                <router-link
                    v-if="item.link"
                    class="nav-link d-flex align-items-center justify-content-between flex-grow"
                    :to="item.link"
                    @click="handleLinkClick"
                >
                  <div class="d-flex align-items-center gap-1">
                    <img src="@/assets/icon/menu-icon.svg" />
                    {{ item.label }}
                  </div>
                </router-link>

                <button
                    v-else
                    type="button"
                    class="nav-link d-flex align-items-center justify-content-between flex-grow"
                    @click.stop="toggleSubMenu(index)"
                >
                  <div class="d-flex align-items-center gap-1">
                    <img src="@/assets/icon/menu-icon.svg" />
                    {{ item.label }}
                  </div>
                </button>
                <button
                    class="ms-2 nav-arrow"
                    type="button"
                    @click.stop="toggleSubMenu(index)"
                    aria-label="toggle submenu"
                >
                  &#9660;
                </button>
              </div>

              <ul
                  v-if="item.children"
                  class="dropdown-menu"
                  :class="{ show: openIndex === index }"
                  @click.stop
              >
                <li v-for="(child, cIdx) in item.children" :key="cIdx">
                  <router-link
                      class="dropdown-item"
                      :to="child.link"
                      @click="handleLinkClick"
                  >
                    {{ child.label }}
                  </router-link>
                </li>
              </ul>
            </li>
            <!-- 會員 icon -->
            <div class="d-flex-block">
              <li class="menu-btn">
                <div class="bc-2 br-1 logIn">
                  <router-link
                      class="nav-link d-flex align-items-center color-2"
                      @click="handleProfileClick"
                      :to="isLoggedIn ? '/account/profile' : '/login'"
                  >
                    <img src="@/assets/icon/member-icon.png" />
                    {{ '會員管理' }}
                  </router-link>
                </div>

                <div class="bc-1 br-1 logIn" v-if="!isLoggedIn">
                  <router-link
                    class="nav-link"
                    to="/login"
                    @click="handleLinkClick"
                  >
                    <img src="@/assets/icon/menu-icon.svg" />
                    登入
                  </router-link>
                </div>
                <div class="bc-1 br-1 logIn" v-else>
                  <router-link
                    class="nav-link"
                    to="/"
                    @click.prevent="handleLogout"
                    >
                    <img src="@/assets/icon/menu-icon.svg" />
                    登出
                  </router-link>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import logoUrl from "@/assets/images/logo.png";
import { toggleMobileAccountSidebar } from "@/composables/useAccountSidebar";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const openIndex = ref(null);
const { isLoggedIn, logout, currentUser } = useAuth();
const isAccountPage = computed(() => route.path.startsWith("/account"));

const isBelowLg = () => window.matchMedia("(max-width: 991.98px)").matches;

const closeAllMenusOnMobile = () => {
  if (isBelowLg()) {
    isMenuOpen.value = false;
    openIndex.value = null;
    toggleMobileAccountSidebar(false);
  }
};

const toggleMenu = () => {
  if (!isMenuOpen.value) {
    toggleMobileAccountSidebar(false);
  }
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleMobileSidebar = () => {
  isMenuOpen.value = false;
  openIndex.value = null;
  toggleMobileAccountSidebar();
};

const toggleSubMenu = (index) => {
  if (isBelowLg()) {
    openIndex.value = openIndex.value === index ? null : index;
  }
  
  // 如果子選單打開，確保 AccountSidebar 關閉 (雖然理論上此時已經是在 menu open 狀態，但加強保險)
  if (openIndex.value !== null) {
      toggleMobileAccountSidebar(false);
  }
};

const handleProfileClick = () => {
  // 未登入 跳轉到登入頁
  if (!isLoggedIn) {
    router.push("/login");
    return;
  }
  if (currentUser.value) {
    router.push(`/account/profile`);
  } else {
    router.push("/account-sales/member");
  }
};

const handleLinkClick = () => {
  if (isBelowLg()) {
    isMenuOpen.value = false;
    openIndex.value = null;
    toggleMobileAccountSidebar(false);
  }
};

const closeMenus = () => {
  if (isBelowLg()) {
    isMenuOpen.value = false;
    openIndex.value = null;
    toggleMobileAccountSidebar(false);
  }
};

watch(
  () => route.fullPath,
  () => {
    closeAllMenusOnMobile();
  }
);

onMounted(() => {
  document.body.addEventListener("click", closeMenus);
});

onBeforeUnmount(() => {
  document.body.removeEventListener("click", closeMenus);
});

const navItems = [
  { label: "關於我們", link: "/about" },
  {
    label: "合作品牌",
    link: "/cooperative-brand",
    children: [{ label: "品牌刊登", link: "/brand-advertising" }],
  },
  { label: "專案一覽", link: "/project" },
  { label: "啟動/參與", link: "/activity" },
  {
    label: "創媒之星",
    children: [
      { label: "創媒之星", link: "/star" },
      { label: "成功案例", link: "/success" },
    ],
  },
  { label: "門市分布", link: "/store" },
];

const isActive = (item) => {
  const current = route.path;
  if (!item.children) return current === item.link;

  if (current === item.link) return true;
  return item.children.some((c) => c.link === current);
};

const handleLogout = async () => {
  await logout();
  handleLinkClick();
  router.push("/");
};
</script>
<style lang="scss" scoped>
.w-100 {
  z-index: 99;
  position: relative;
}

.container {
  padding-top: 1.5rem;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.navbar {
  background: linear-gradient(to bottom, #ff714acc, #ff5f31cc);
  box-shadow: 0px 4px 6px rgba(87, 80, 78, 0.25);
  backdrop-filter: blur(3px);
  padding: 10px 40px;
  border-radius: 50px;
  height: 70px;

  @media (max-width: 767px) {
    padding: 10px 25px;
    position: relative;
  }

  .navbar-toggler {
    border: none;
    background: none;
    color: transparent;
  }
}

.user-toggler {
  border: none;
  background: transparent;
  margin-left: auto;
  margin-right: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 44px;
  padding: 0;
  img {
    width: 24px;
    height: 24px;
  }
}

.navbar-collapse {
  display: none;

  &.open {
    display: block;
    background: linear-gradient(to bottom, #ff714aee, #ff5f31ee);
    @media (max-width: 767px) {
      border-radius: 15px;
      margin-top: 1rem;
      position: absolute;
      top: 78%;
      width: 94%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  @media (min-width: 992px) {
    display: flex !important;
  }
}

.navbar-nav {
  @media (min-width: 1680px) {
    gap: 0.2rem;
  }

  .nav-item {
    position: relative;
    border: 2px solid transparent;
    &:hover {
      border-radius: 50px;
      padding: 0;
      @media (min-width: 768px) {
        border: 2px solid #ffcc66;
      }
    }

    &.active > .nav-link,
    &.active .nav-link {
      @media (min-width: 768px) {
        border: 2px solid #ffcc66;
        border-radius: 50px;
      }
    }

    .nav-link {
      font-weight: 600;
      font-size: 16px;
      color: #fff;
      line-height: 19px;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      cursor: pointer;

      @media (max-width: 992px) {
        padding: 15px 25px;
        width: 100%;
      }
    }

    .dropdown-menu {
      display: none;

      @media (min-width: 768px) {
        position: absolute;
        top: 38px;
        left: 0;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 0;
        min-width: 108px;
        border-radius: 20px;
        background: linear-gradient(
                95.14deg,
                rgba(255, 113, 74, 0.8) 36.47%,
                rgba(255, 95, 49, 0.8) 64.66%
        );
        backdrop-filter: blur(2px);
      }

      @media (max-width: 767px) {
        position: relative;
        box-shadow: none;
      }

      li {
        display: flex;
        justify-content: center;
        @media (max-width: 576px) {
          justify-content: start;
        }
      }

      .dropdown-item {
        width: 108px;
        height: 38px;
        border-radius: 20px;
        text-align: center;
        align-content: center;
        padding: 0;

        @media (max-width: 767px) {
          padding: 8px 12px;
          text-align: center;
        }
        @media (min-width: 768px) {
          color: #fff;
        }
        &:hover {
          background-color: #ff5f31;
        }
      }

      &.show {
        display: block;

        border: none;
        border-radius: 0;
        @media (min-width: 768px) {
          display: none !important;
        }

        @media (max-width: 767px) {
          background: #f17e5d;
          padding: 0.25rem 10px;
        }
        a {
          @media (max-width: 767px) {
            color: #fff;
          }
        }
      }
    }
    .nav-arrow {
      @media (min-width: 768px) {
        display: none;
      }
    }
    @media (min-width: 768px) {
      &.has-children:hover .dropdown-menu {
        display: block;
      }
    }
  }
}

.nav-arrow {
  border: none;
  background: transparent;
  color: #fff;
  padding-right: 1rem;
}

/* ⭐ 新增：會員和登入/登出的容器樣式 */
.user-login-wrapper {
  display: flex;
  align-items: start;
  gap: 10px;
  list-style: none;

  // 桌面版：保持原樣（垂直排列）
  @media (min-width: 992px) {
    flex-direction: row;
    gap: 0.5rem;
  }

  // 響應式：並排顯示
  @media (max-width: 991px) {
    flex-direction: row;
    justify-content: start;
    padding: 10px 20px;
    margin-top: 10px;
  }
}


.member-icon {
  padding: 0;

  @media (min-width: 992px) {
    padding: 0 20px;
  }

  @media (max-width: 991px) {
    padding: 0;
  }
}

.member-icon-img {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

// ⭐ 修改：響應式時登入/登出按鈕的樣式
.user-login-wrapper .logIn {
  @media (max-width: 991px) {
    margin: 0;

    .nav-link {
      padding: 8px 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 50px;
      background-color: rgba(255, 255, 255, 0.1);

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>
