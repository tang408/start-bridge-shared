<template>
  <router-view :key="$route.path" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useAuth } from "@/composables/useAuth";

const { logout, isLoggedIn } = useAuth();

// 每次操作都更新最後活動時間
const updateLastActivity = () => {
  localStorage.setItem('lastActivity', Date.now().toString());
};

// 檢查是否需要登出
const checkSession = () => {
  const lastActivity = localStorage.getItem('lastActivity');

  if (lastActivity && isLoggedIn.value) {
    const timeDiff = Date.now() - parseInt(lastActivity);
    const TIMEOUT = 60 * 1000; // 30分鐘無活動就登出

    if (timeDiff > TIMEOUT) {
      console.log('長時間無活動,執行登出');
      logout();
      localStorage.removeItem('auth');
      localStorage.removeItem('lastActivity');
    }
  }
};

onMounted(() => {
  console.log("App mounted!");

  // 檢查 session
  checkSession();

  // 更新最後活動時間
  updateLastActivity();

  // 監聽用戶活動
  window.addEventListener('click', updateLastActivity);
  window.addEventListener('keydown', updateLastActivity);
  window.addEventListener('scroll', updateLastActivity);

  // 定期檢查 session (每分鐘檢查一次)
  const intervalId = setInterval(checkSession, 60000);

  // 清理函數
  onBeforeUnmount(() => {
    clearInterval(intervalId);
    window.removeEventListener('click', updateLastActivity);
    window.removeEventListener('keydown', updateLastActivity);
    window.removeEventListener('scroll', updateLastActivity);
  });
});
</script>

<style lang="scss">
@use "@/assets/styles/scss/style.scss" as *;
</style>
