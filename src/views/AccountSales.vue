<template>
  <div class="back-background">
    <div class="container d-flex-block gap-5">
      <Sidebar
        :displayName="user.name"
        :avatar="user.avatar"
        @select="onSelect"
        @logout="onLogout"
        class="account-sidebar"
      />
      <div class="back-content w-100">
        <RouterView v-slot="{ Component, route }">
          <KeepAlive>
            <component v-if="route.meta?.keepAlive" :is="Component" />
          </KeepAlive>
          <component v-if="!route.meta?.keepAlive" :is="Component" />
        </RouterView>
        <transition name="fade">
          <div
            v-if="mobileAccountSidebarOpen"
            class="m-account-overlay d-lg-none"
            @click.self="toggleMobileAccountSidebar(false)"
          >
            <transition name="slide-right">
              <div class="m-account-panel" v-if="mobileAccountSidebarOpen">
                <Sidebar
                  :displayName="user.name"
                  :avatar="user.avatar"
                  @select="onSelect"
                  @logout="onLogout"
                />
              </div>
            </transition>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import Sidebar from "@/components/SalesSidebar.vue";
import {
  mobileAccountSidebarOpen,
  toggleMobileAccountSidebar,
} from "@/composables/useAccountSidebar";

const router = useRouter();
const route = useRoute();

const user = {
  name: "帳號名稱帳號名稱",
  avatar: new URL("@/assets/images/avatar.png", import.meta.url).href,
};

function onSelect(item) {
  if (route.name !== item.key) {
    router.push({ name: item.key });
  }
}

function onLogout() {
  router.push({ name: "Login" });
}
</script>
<style lang="scss" scoped>
.account-sidebar {
  @media (max-width: 991px) {
    display: none;
  }
}
</style>
