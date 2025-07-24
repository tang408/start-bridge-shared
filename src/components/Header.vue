<template>
  <div class="w-100">
    <div class="container">
      <nav class="navbar navbar-expand-lg">
        <router-link class="navbar-brand logo" to="/">
          <img :src="logoUrl" alt="Logo" height="32" />
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          @click.stop="isMenuOpen = !isMenuOpen"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div :class="['navbar-collapse', { open: isMenuOpen }]" id="navbarNav">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li
              class="nav-item"
              :class="{ 'has-children': item.children }"
              v-for="(item, index) in navItems"
              :key="index"
            >
              <div
                class="nav-link d-flex align-items-center justify-content-between"
                @click.stop="
                  item.children ? toggleSubMenu(index) : handleLinkClick()
                "
              >
                <div class="d-flex align-items-center gap-1">
                  <img src="@/assets/icon/menu-icon.svg" />
                  {{ item.label }}
                </div>
                <span v-if="item.children" class="ms-2 nav-arrow">&#9660;</span>
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

            <li class="nav-item bc-1 br-1 logIn">
              <router-link
                class="nav-link"
                to="/login"
                @click="handleLinkClick"
              >
                <img src="@/assets/icon/menu-icon.svg" />
                登入
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import logoUrl from "@/assets/images/logo.png";

const isMenuOpen = ref(false);
const openIndex = ref(null);

const toggleSubMenu = (index) => {
  if (window.innerWidth <= 767) {
    openIndex.value = openIndex.value === index ? null : index;
  }
};

const handleLinkClick = () => {
  if (window.innerWidth <= 767) {
    isMenuOpen.value = false;
    openIndex.value = null;
  }
};

const closeMenus = () => {
  if (window.innerWidth <= 767) {
    isMenuOpen.value = false;
    openIndex.value = null;
  }
};

onMounted(() => {
  document.body.addEventListener("click", closeMenus);
});

onBeforeUnmount(() => {
  document.body.removeEventListener("click", closeMenus);
});

const navItems = [
  { label: "關於我們", link: "/" },
  {
    label: "合作品牌",
    link: "/",
    children: [{ label: "品牌刊登", link: "/" }],
  },
  { label: "專案一覽", link: "/" },
  { label: "啟動/參與", link: "/" },
  {
    label: "創媒之星",
    link: "/",
    children: [{ label: "成功案例", link: "/" }],
  },
  { label: "門市分布", link: "/" },
];
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
    color: #fff;
  }
}

.navbar-collapse {
  display: none;

  &.open {
    display: block;
    background: linear-gradient(to bottom, #ff714aee, #ff5f31ee);
    @media (max-width: 767px) {
      border-radius: 5px 5px 15px 15px;
      margin-top: 1rem;
      position: absolute;
      top: 78%;
      width: 94%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  @media (min-width: 768px) {
    display: flex !important;
  }
}

.navbar-nav {
  @media (min-width: 1680px) {
    gap: 0.2rem;
  }

  .nav-item {
    position: relative;
    &:hover {
      border-radius: 10px;
      padding: 0;
      @media (min-width: 768px) {
        border: 2px solid #ffcc66;
      }
    }

    &.logIn:hover {
      border-radius: 50px;
      @media (min-width: 768px) {
        background-color: #373838;
        border: none;
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

      @media (max-width: 767px) {
        padding: 15px 20px;
        width: 100%;
      }
    }

    .dropdown-menu {
      display: none;

      @media (min-width: 768px) {
        position: absolute;
        top: 38px;
        left: -8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 0;
        min-width: 120px;
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

      .dropdown-item {
        width: 120px;
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
</style>
