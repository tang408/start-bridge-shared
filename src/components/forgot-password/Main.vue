<template>
  <div class="back-background">
    <div class="back-content container">
      <div class="fs-24" v-if="step === 1">忘記密碼</div>

      <form v-if="step === 1" @submit.prevent="sendResetLink" class="form mt-4">
        <SharedInput
          id="account"
          label="請輸入 Email 或手機"
          placeholder="Email 或手機號碼"
          v-model="account"
          :error="errors.account"
        />

        <button type="submit" class="btn-confirm mt-3">發送重設連結</button>
      </form>

      <div v-else-if="step === 2" class="sent-msg">
        <p>連結已發送，請至信箱或手機獲取連結</p>
        <p>進入連結後重設密碼</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {userApi} from "@/api/modules/user.js";
import {NewAlert} from "@/composables/useAlert.js";

const step = ref(1);
const account = ref("");
const errors = ref({ account: "" });
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^09\d{8}$/;

async function sendResetLink() {
  errors.value.account = "";

  if (!account.value) {
    errors.value.account = "請輸入 Email 或手機";
    return;
  }

  if (!emailRegex.test(account.value) && !phoneRegex.test(account.value)) {
    errors.value.account = "請輸入有效的 Email 或手機號碼";
    return;
  }

  const params = {
    account: account.value,
  };

  const res = await userApi.sendResetPasswordUrl(params)
  if (res.code === 0) {
    await NewAlert.show("成功！", "重設密碼連結已發送至您的信箱或手機，請前往查看。");
  } else {
    await NewAlert.show("錯誤！", res.message + ",發送重設密碼連結失敗，請洽客服人員。");
    return;
  }

  setTimeout(() => {
    step.value = 2;
  }, 800);
}
</script>
<style lang="scss" scoped>
.sent-msg {
  margin-top: 20px;
  font-size: 18px;
  line-height: 1.8;
  color: #333;
}
</style>
