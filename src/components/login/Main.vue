<template>
  <div class="back-background">
    <div class="back-content container">
      <div class="fs-24">登入</div>
      <form @submit.prevent="handleLogin" class="form">
        <div class="form-display">
          <SharedInput
            id="username"
            label="帳號*"
            placeholder="請輸入帳號"
            autocomplete="username"
            v-model="username"
            :error="errors.username"
            required
          />

          <SharedInput
              id="password"
              type="password"
              label="密碼*"
              placeholder="請輸入密碼"
              autocomplete="current-password"
              v-model="password"
              :error="errors.password"
              required
          />
        </div>

        <button type="submit" class="btn-confirm">登入</button>

        <div class="links">
          <p>
            登入有問題？<RouterLink to="/forgot-password">忘記密碼</RouterLink>
          </p>
          <p>還沒有帳號？<RouterLink to="/entSignUp">註冊</RouterLink></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {userApi} from "@/api/modules/user.js";
import router from "@/router/index.js";
import { useAuth } from "@/composables/useAuth.js";

const { login, redirectTo } = useAuth();
const username = ref("");
const password = ref("");
const errors = ref({ username: "", password: "" });

async function handleLogin() {
  errors.value = { username: "", password: "" };

  if (!username.value) {
    errors.value.username = "請輸入帳號";
  }

  if (!password.value) {
    errors.value.password = "請輸入密碼";
  }

  if (errors.value.username || errors.value.password) return;

  const params = {
    account: username.value,
    password: password.value,
  };

  try {
    const response = await userApi.login(params);
    if (response.code === 0) {
      // 判斷回傳的是 salesId 還是 userId
      const isSalesLogin = response.data.hasOwnProperty('salesId');
      const isUserLogin = response.data.hasOwnProperty('userId');

      let loginPayload = {
        token: response.data.token,
        user: null,
        sales: null
      };

      if (isSalesLogin) {
        loginPayload.sales = response.data.salesId;
      } else if (isUserLogin) {
        loginPayload.user = response.data.userId;
      }

      await login(loginPayload);

      // 根據登入類型跳轉到不同頁面
      try {
        setTimeout(() => {
          if (isSalesLogin) {
            // 銷售人員跳轉到銷售頁面
            if (router.currentRoute.value.path !== '/account-sales') {
              window.location.href = '/account-sales';
            }
          } else {
            // 一般用戶跳轉到個人資料頁面
            if (router.currentRoute.value.path !== '/account/profile') {
              window.location.href = '/account/profile';
            }
          }
        }, 100);
      } catch (routerError) {
        if (isSalesLogin) {
          window.location.href = '/account-sales';
        } else {
          window.location.href = '/account/profile';
        }
      }
    } else {
      alert(response.message || '登入失敗，請稍後再試');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('登入失敗，請稍後再試');
  }
}
</script>
