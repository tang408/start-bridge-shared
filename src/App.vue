<template>
  <router-view :key="$route.path" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { NewAlert } from "@/composables/useAlert.js";

const router = useRouter();
const route = useRoute();
const { logout, isLoggedIn } = useAuth();

// ✅ 控制自動登出功能的開關
const AUTO_LOGOUT_ENABLED = true; // true 啟用，false 停用

// ✅ 1 小時無活動就登出
const TIMEOUT = 60 * 60 * 1000; // 1小時
// const TIMEOUT= 10 * 1000; // 改成 10 秒
// ✅ 定義不需要登入的頁面
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/'];

// ✅ 檢查當前頁面是否為公開頁面
const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(publicPath => path.startsWith(publicPath));
};

// ✅ 閒置計時器
let idleTimer = null;

// ✅ 執行登出並跳轉
const performLogout = async (reason = '長時間未使用') => {
  console.log(`${reason}，執行登出`);

  await logout();
  localStorage.removeItem('lastActiveTime');
  localStorage.removeItem('lastCloseTime');

  // 清除閒置計時器
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

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

// ✅ 重置閒置計時器
const resetIdleTimer = () => {
  if (!AUTO_LOGOUT_ENABLED) return;
  if (!isLoggedIn.value) return;
  if (isPublicRoute(route.path)) return;

  // 清除舊的計時器
  if (idleTimer) {
    clearTimeout(idleTimer);
  }

  // 更新最後活動時間
  localStorage.setItem('lastActiveTime', Date.now().toString());

  // 設置新的計時器
  idleTimer = setTimeout(() => {
    performLogout('閒置超過 1 小時');
  }, TIMEOUT);

  console.log('閒置計時器已重置');
};

// ✅ 檢查關閉頁面時間（僅在頁面載入時執行一次）
const checkIfShouldLogout = () => {
  if (!AUTO_LOGOUT_ENABLED) return;
  if (isPublicRoute(route.path)) return;
  if (!isLoggedIn.value) return;

  const lastCloseTime = localStorage.getItem('lastCloseTime');
  const lastActiveTime = localStorage.getItem('lastActiveTime');

  // 優先檢查關閉時間
  if (lastCloseTime) {
    const timeDiff = Date.now() - parseInt(lastCloseTime);

    console.log(`上次關閉頁面時間: ${new Date(parseInt(lastCloseTime)).toLocaleString()}`);
    console.log(`距離現在: ${Math.floor(timeDiff / 1000 / 60)} 分鐘`);

    if (timeDiff > TIMEOUT) {
      performLogout('關閉頁面超過 1 小時');
      return;
    } else {
      // 清除記錄，因為用戶已經回來了
      localStorage.removeItem('lastCloseTime');
    }
  }

  // 檢查最後活動時間
  if (lastActiveTime) {
    const timeDiff = Date.now() - parseInt(lastActiveTime);

    if (timeDiff > TIMEOUT) {
      performLogout('閒置超過 1 小時');
      return;
    }
  }

  // 啟動閒置計時器
  resetIdleTimer();
};

// ✅ 監聽頁面即將關閉/離開
const handleBeforeUnload = () => {
  if (!AUTO_LOGOUT_ENABLED) return;
  if (!isLoggedIn.value) return;

  // 記錄關閉時間
  localStorage.setItem('lastCloseTime', Date.now().toString());
  console.log('頁面關閉，記錄時間:', new Date().toLocaleString());
};

// ✅ 監聽頁面可見性變化
const handleVisibilityChange = () => {
  if (!AUTO_LOGOUT_ENABLED) return;
  if (!isLoggedIn.value) return;

  if (document.hidden) {
    // 頁面隱藏時，暫停計時器並記錄當前時間
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    // 只記錄隱藏時間，不改變 lastActiveTime
    localStorage.setItem('lastHiddenTime', Date.now().toString());
    console.log('頁面隱藏，記錄時間');
  } else {
    // 頁面重新可見
    console.log('頁面重新可見');

    const lastActiveTime = localStorage.getItem('lastActiveTime');
    const lastHiddenTime = localStorage.getItem('lastHiddenTime');

    if (lastActiveTime && lastHiddenTime) {
      // 計算總閒置時間 = (隱藏前的閒置) + (隱藏期間的時間)
      const hiddenStart = parseInt(lastHiddenTime);
      const activeTime = parseInt(lastActiveTime);
      const totalIdleTime = Date.now() - activeTime;

      console.log(`總閒置時間: ${Math.floor(totalIdleTime / 1000 / 60)} 分鐘`);

      if (totalIdleTime > TIMEOUT) {
        localStorage.removeItem('lastHiddenTime');
        performLogout('閒置超過 1 小時');
        return;
      }
    }

    // 清除隱藏時間記錄
    localStorage.removeItem('lastHiddenTime');

    // 重新啟動閒置計時器（使用剩餘時間）
    const lastActive = parseInt(lastActiveTime || Date.now().toString());
    const elapsed = Date.now() - lastActive;
    const remainingTime = Math.max(0, TIMEOUT - elapsed);

    if (remainingTime > 0) {
      idleTimer = setTimeout(() => {
        performLogout('閒置超過 1 小時');
      }, remainingTime);
      console.log(`重新啟動計時器，剩餘 ${Math.floor(remainingTime / 1000 / 60)} 分鐘`);
    } else {
      performLogout('閒置超過 1 小時');
    }
  }
};

// ✅ 監聽用戶活動（滑鼠移動、鍵盤輸入、點擊等）
const userActivityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

const handleUserActivity = () => {
  resetIdleTimer();
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

  // ✅ 監聽頁面可見性變化
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // ✅ 監聽用戶活動
  userActivityEvents.forEach(event => {
    window.addEventListener(event, handleUserActivity, { passive: true });
  });
});

onBeforeUnmount(() => {
  // 清除所有監聽器
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  userActivityEvents.forEach(event => {
    window.removeEventListener(event, handleUserActivity);
  });

  // 清除閒置計時器
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
});
</script>

<style lang="scss">
@use "@/assets/styles/scss/style.scss" as *;
</style>
