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
import { useRouter, useRoute, onBeforeRouteUpdate } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import {
  mobileAccountSidebarOpen,
  toggleMobileAccountSidebar,
} from "@/composables/useAccountSidebar";
import { onMounted, ref } from "vue";
import { userApi } from "@/api/modules/user.js";
import { useAuth } from "@/composables/useAuth.js";
import { useNotifications } from '@/composables/useNotifications.js';

const { initUnreadCounts } = useNotifications('user');

const router = useRouter();
const route = useRoute();
const { isLoggedIn, currentUser } = useAuth();

const user = ref({
  name: "",
  avatar: "",
  type: 0
});

async function getUserNameAndAvatar() {
  const formData = {
    userId: currentUser.value,
  }
  const response = await userApi.getUserNameAndAvatar(formData);
  user.value = response.data;
  console.log(response.data)

  // 獲取用戶資料後，檢查當前路由
  checkContractAccess();
}

// 檢查是否可以訪問 contracts 頁面
function checkContractAccess() {
  if (route.name === 'Contract' && user.value.type === 0) {
    alert('您沒有權限訪問此頁面');
    router.push({ name: 'profile' }); // 重定向到其他頁面
  }
}

// 監聽路由變化
onBeforeRouteUpdate((to, from) => {
  if (to.name === 'contracts' && user.value.type === 0) {
    alert('您沒有權限訪問此頁面');
    return { name: 'profile' }; // 阻止導航並重定向
  }
})

onMounted(() => {
  if (isLoggedIn.value) {
    getUserNameAndAvatar();
    initUnreadCounts(currentUser.value);
  } else {
    router.push({ name: "login" });
  }
});

function onSelect(item) {
  // 在導航前檢查權限
  if (item.key === 'contracts' && user.value.type === 0) {
    alert('您沒有權限訪問此頁面');
    return;
  }

  if (route.name !== item.key) {
    router.push({ name: item.key });
  }
}

function onLogout() {
  router.push({ name: "login" });
}
</script>
<style lang="scss" scoped>
.account-sidebar {
  @media (max-width: 991px) {
    display: none;
  }
}
</style>
