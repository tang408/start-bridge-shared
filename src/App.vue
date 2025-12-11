<template>
  <router-view :key="$route.path" />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { NewAlert } from "@/composables/useAlert.js";

const router = useRouter();
const route = useRoute();
const { logout, isLoggedIn } = useAuth();

// ✅ 控制自動登出功能的開關
const AUTO_LOGOUT_ENABLED = false; // 改成 false 就停用自動登出

// ✅ 定義不需要登入的頁面
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/'];

// ✅ 檢查當前頁面是否為公開頁面
const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(publicPath => path.startsWith(publicPath));
};

// 每次操作都更新最後活動時間
const updateLastActivity = () => {
  if (!AUTO_LOGOUT_ENABLED) return; // ✅ 功能關閉時直接返回

  if (isLoggedIn.value) {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};

// ✅ 執行登出並跳轉
const performLogout = async (reason = '長時間無活動') => {
  console.log(`${reason}，執行登出`);

  await logout();
  localStorage.removeItem('auth');
  localStorage.removeItem('lastActivity');

  // 如果不在公開頁面，顯示提示並跳轉
  if (!isPublicRoute(route.path)) {
    await NewAlert.show(
        "登入逾時",
        `${reason}，請重新登入`
    );

    await router.push({
      path: '/login',
      query: {redirect: route.fullPath} // 記錄原本要去的頁面
    });
  }
};

// 檢查是否需要登出
const checkSession = () => {
  if (!AUTO_LOGOUT_ENABLED) return; // ✅ 功能關閉時直接返回

  // ✅ 如果已經在公開頁面，不需要檢查
  if (isPublicRoute(route.path)) {
    return;
  }

  const lastActivity = localStorage.getItem('lastActivity');

  if (lastActivity && isLoggedIn.value) {
    const timeDiff = Date.now() - parseInt(lastActivity);
    const TIMEOUT = 20 * 60 * 1000; // 20分鐘無活動就登出

    if (timeDiff > TIMEOUT) {
      performLogout('長時間無活動');
    }
  } else if (!isLoggedIn.value) {
    // ✅ 如果已經登出，跳轉到登入頁
    performLogout('登入狀態已失效');
  }
};

// ✅ 監聽用戶活動並檢查登入狀態
const handleUserActivity = (event) => {
  if (!AUTO_LOGOUT_ENABLED) return; // ✅ 功能關閉時直接返回

  // 先檢查是否已登出
  if (!isLoggedIn.value && !isPublicRoute(route.path)) {
    event.preventDefault();
    event.stopPropagation();
    performLogout('登入狀態已失效');
    return;
  }

  // 更新活動時間
  updateLastActivity();
};

let intervalId = null;

onMounted(() => {
  console.log("App mounted!");

  if (!AUTO_LOGOUT_ENABLED) {
    console.log("自動登出功能已停用"); // ✅ 提示功能已關閉
    return;
  }

  // 初始檢查
  checkSession();

  // 如果已登入，更新最後活動時間
  if (isLoggedIn.value) {
    updateLastActivity();
  }

  // ✅ 監聽用戶活動（使用 capture 模式優先捕獲）
  window.addEventListener('click', handleUserActivity, true);
  window.addEventListener('keydown', handleUserActivity, true);
  window.addEventListener('scroll', handleUserActivity, true);
  window.addEventListener('mousemove', handleUserActivity, true);

  // 定期檢查 session (每分鐘檢查一次)
  intervalId = setInterval(checkSession, 60000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  window.removeEventListener('click', handleUserActivity, true);
  window.removeEventListener('keydown', handleUserActivity, true);
  window.removeEventListener('scroll', handleUserActivity, true);
  window.removeEventListener('mousemove', handleUserActivity, true);
});
</script>

<style lang="scss">
@use "@/assets/styles/scss/style.scss" as *;
</style>
