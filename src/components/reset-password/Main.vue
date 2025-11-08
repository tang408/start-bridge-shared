<template>
  <div class="back-background">
    <div class="back-content container">
      <div class="fs-24">重設密碼</div>

      <form @submit.prevent="resetPassword" class="form mt-4">
        <div class="form-display">
          <SharedInput
            id="newPassword"
            type="password"
            label="新密碼"
            placeholder="請輸入新密碼"
            v-model="newPassword"
            :error="errors.newPassword"
          />

          <SharedInput
            id="confirmPassword"
            type="password"
            label="確認密碼"
            placeholder="請再次輸入新密碼"
            v-model="confirmPassword"
            :error="errors.confirmPassword"
          />
        </div>

        <button type="submit" class="btn-confirm mt-3">送出</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {useRoute, useRouter} from "vue-router";
import {userApi} from "@/api/modules/user.js";
import {NewAlert} from "@/composables/useAlert.js";


const route = useRoute();
const router = useRouter();

const token = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errors = ref({
  newPassword: "",
  confirmPassword: "",
});

// 頁面載入時獲取 token
onMounted(() => {
  token.value = route.query.token || "";
  console.log(token.value)
  // 如果沒有 token，跳轉到錯誤頁面或登入頁面
  if (!token.value) {
    NewAlert.show("注意！", "無效的重設密碼連結，請重新申請重設密碼。");
    router.push("/login");
  }
});

async function resetPassword() {
  errors.value = { newPassword: "", confirmPassword: "" };

  if (!newPassword.value) {
    errors.value.newPassword = "請輸入新密碼";
  }
  if (!confirmPassword.value) {
    errors.value.confirmPassword = "請再次輸入新密碼";
  } else if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = "兩次輸入的密碼不一致";
  }

  if (errors.value.newPassword || errors.value.confirmPassword) return;

  const formData = {
    token : token.value,
    newPassword: newPassword.value,
  }

  const res = await userApi.resetPassword(formData);
  if (res.code === 0) {
    await NewAlert.show("成功！", "密碼重設成功，請使用新密碼登入。");
    await router.push("/login");
  } else {
    await NewAlert.show("注意！", res.message + ",密碼重設失敗，請洽客服人員。");
    return;
  }
}
</script>
