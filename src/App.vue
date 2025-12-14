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
const AUTO_LOGOUT_ENABLED = true; // true 啟用，false 停用

// ✅ 15 分鐘無活動就登出
const TIMEOUT = 15 * 60 * 1000; // 15分鐘

// ✅ 定義不需要登入的頁面
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/'];

// ✅ 檢查當前頁面是否為公開頁面
const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(publicPath => path.startsWith(publicPath));
};

// ✅ 執行登出並跳轉
const performLogout = async (reason = '長時間未使用') => {
  console.log(`${reason}，執行登出`);

  await logout();
  localStorage.removeItem('lastCloseTime');

  // 如果不在公開頁面，顯示提示並跳轉
  if (!isPublicRoute(route.path)) {
    await NewAlert.show(
        "登入逾時",
        `${reason}，請重新登入`
    );

    await router.push({
      path: '/login',
      query: {redirect: route.fullPath}
    });
  }
};

// ✅ 檢查是否需要登出（僅在頁面載入時執行一次）
const checkIfShouldLogout = () => {
  if (!AUTO_LOGOUT_ENABLED) return;
  if (isPublicRoute(route.path)) return;
  if (!isLoggedIn.value) return;

  const lastCloseTime = localStorage.getItem('lastCloseTime');

  if (lastCloseTime) {
    const timeDiff = Date.now() - parseInt(lastCloseTime);

    console.log(`上次關閉頁面時間: ${new Date(parseInt(lastCloseTime)).toLocaleString()}`);
    console.log(`距離現在: ${Math.floor(timeDiff / 1000 / 60)} 分鐘`);

    if (timeDiff > TIMEOUT) {
      performLogout('長時間未使用');
    } else {
      // 清除記錄，因為用戶已經回來了
      localStorage.removeItem('lastCloseTime');
    }
  }
};

// ✅ 監聽頁面即將關閉/離開
const handleBeforeUnload = () => {
  if (!AUTO_LOGOUT_ENABLED) return;
  if (!isLoggedIn.value) return;

  // 記錄關閉時間
  localStorage.setItem('lastCloseTime', Date.now().toString());
  console.log('頁面關閉，記錄時間:', new Date().toLocaleString());
};

// ✅ 監聽頁面可見性變化（可選，用於偵測分頁切換）
const handleVisibilityChange = () => {
  if (!AUTO_LOGOUT_ENABLED) return;

  if (document.hidden) {
    // 頁面隱藏（切換分頁或最小化）
    console.log('頁面隱藏');
  } else {
    // 頁面重新可見
    console.log('頁面重新可見');
    // 清除關閉時間記錄（因為用戶還在使用）
    localStorage.removeItem('lastCloseTime');
  }
};

onMounted(() => {
  console.log("App mounted!");

  if (!AUTO_LOGOUT_ENABLED) {
    console.log("自動登出功能已停用");
    return;
  }

  // ✅ 頁面載入時檢查是否需要登出
  checkIfShouldLogout();

  // ✅ 監聽頁面即將關閉
  window.addEventListener('beforeunload', handleBeforeUnload);

  // ✅ 監聽頁面可見性變化（可選）
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style lang="scss">
@use "@/assets/styles/scss/style.scss" as *;
</style>
