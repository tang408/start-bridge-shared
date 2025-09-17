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

        <button type="submit" class="btn-login">登入</button>

        <div class="links">
          <p>
            登入有問題？<a href="#">忘記密碼</a> 或 <a href="#">變更帳號</a>
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
      await login({
        token: response.data.token,  // 根據你的 API 回傳結構調整
        user: response.data.userId,  // 根據你的 API 回傳結構調整
      });

      // 跳轉到目標頁面
      try {
        setTimeout(() => {
          if (router.currentRoute.value.path !== '/account/profile') {
            window.location.href = '/account/profile';
          }
        }, 100);
      } catch (routerError) {
        window.location.href = '/account/profile';
      }
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('登入失敗，請稍後再試');
  }
}
</script>
