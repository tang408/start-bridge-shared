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

// ✅ 定義不需要登入的頁面
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/'];

// ✅ 檢查當前頁面是否為公開頁面
const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(publicPath => path.startsWith(publicPath));
};

// 每次操作都更新最後活動時間
const updateLastActivity = () => {
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
      query: { redirect: route.fullPath }
    });
  }
};

// 檢查是否需要登出
const checkSession = () => {
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

onMounted(async () => {
  console.log("App mounted!");

  // 🆕 檢查 sessionStorage 中是否有活動標記
  const isActiveSession = sessionStorage.getItem('activeSession');

  if (!isActiveSession) {
    // 沒有標記 = 新開的分頁或關閉後重開
    console.log("新開的分頁或關閉後重開，清除 auth");

    // 清除 localStorage 中的 auth
    await logout(); // 使用 useAuth 提供的 logout
    localStorage.removeItem('lastActivity'); // lastActivity 不是 auth 管的，所以維持手動清除

    // 如果不在公開頁面，跳轉到登入頁
    if (!isPublicRoute(route.path)) {
      await router.push({
        path: '/login',
        query: {redirect: route.fullPath}
      });
    }
  } else {
    console.log("刷新頁面或切換回來，保持登入狀態");
  }

  // 🆕 設置活動標記（刷新時會保留，關閉分頁時會自動清除）
  sessionStorage.setItem('activeSession', 'true');

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
