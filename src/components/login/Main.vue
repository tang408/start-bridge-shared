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

const username = ref("");
const password = ref("");
const errors = ref({ username: "", password: "" });

function handleLogin() {
  errors.value = { username: "", password: "" };

  if (!username.value) {
    errors.value.username = "請輸入帳號";
  }

  if (!password.value) {
    errors.value.password = "請輸入密碼";
  }

  if (errors.value.username || errors.value.password) return;

  const fakeApiResponse = {
    success: false,
    errors: {
      username: true,
      password: true,
    },
  };

  if (!fakeApiResponse.success) {
    if (fakeApiResponse.errors.username) {
      errors.value.username = "查無此帳號";
    }
    if (fakeApiResponse.errors.password) {
      errors.value.password = "密碼錯誤，請重新輸入。";
    }
  } else {
    router.push({ path: "/account/profile" });
  }
}
</script>
