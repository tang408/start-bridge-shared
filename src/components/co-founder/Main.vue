<template>
  <div class="back-background">
    <div class="back-content container">
      <div class="fs-24">註冊</div>

      <form @submit.prevent="handleRegister" class="form">
        <div class="form-display">
          <!-- 手機電話 + 驗證碼 -->
          <SharedInput
            id="phone"
            type="tel"
            label="聯絡電話*(作為登入帳號使用)"
            autocomplete="tel"
            v-model="form.phone"
            :error="errors.phone"
            required
            buttonText="寄送驗證碼"
            @button-click="sendPhoneOTP"
            :sent="phoneOtp.sent"
            :countdown="phoneOtp.seconds"
            resendText="重新寄送"
            @resend="resendPhoneOTP"
            :enable-if="phoneEnableIf"
            inputmode="numeric"
            maxlength="10"
          />

          <!-- 密碼 / 再次輸入密碼 -->
          <SharedPassword
            id="password"
            label="密碼*"
            v-model="form.password"
            :error="errors.password"
            @valid-change="(ok) => (state.passwordOk = ok)"
          />

          <SharedInput
            id="confirmPassword"
            type="password"
            label="再次輸入密碼*"
            autocomplete="new-password"
            v-model="form.confirmPassword"
            :error="errors.confirmPassword"
          />

          <!-- 姓名 -->
          <SharedInput
            id="name"
            label="姓名*"
            v-model="form.name"
            :error="errors.name"
            required
          />

          <!-- 性別 -->
          <SharedRadio
            label="性別*"
            v-model="form.gender"
            :options="[
              { value: 'male', text: '男性' },
              { value: 'female', text: '女性' },
            ]"
            :error="errors.gender"
            required
          />

          <!-- 出生年月日 -->
          <div class="form-group">
            <label for="birthday">出生年月日*</label>
            <input
              id="birthday"
              type="date"
              v-model="form.birthday"
              :class="{ 'is-invalid': errors.birthday }"
              required
            />
            <p class="error-msg" v-if="errors.birthday">
              {{ errors.birthday }}
            </p>
          </div>

          <!-- Line -->
          <SharedInput
            id="line"
            label="Line*"
            v-model="form.line"
            :error="errors.line"
            required
          />

          <!-- 電子郵件 + 驗證碼 -->
          <SharedInput
            id="email"
            type="email"
            label="電子郵件*"
            autocomplete="email"
            v-model="form.email"
            :error="errors.email"
            required
            buttonText="寄送驗證碼"
            @button-click="sendEmailOTP"
            :sent="emailOtp.sent"
            :countdown="emailOtp.seconds"
            @resend="resendEmailOTP"
            :enable-if="emailEnableIf"
          />

          <!-- 投資預算*(自備款3成) -->
          <SharedSelect
            id="industry"
            label="投資預算*(自備款3成)*"
            placeholder="請選擇"
            v-model="form.industry"
            :options="[
              { value: '200,000', text: 'NTD 200,000' },
              { value: '300,000', text: 'NTD 300,000' },
              { value: '400,000', text: 'NTD 400,000' },
              { value: '600,000', text: 'NTD 500,000' },
              { value: '700,000', text: 'NTD 600,000' },
            ]"
            :error="errors.industry"
            required
          />

          <!-- 推薦碼 -->
          <SharedInput
            id="code"
            label="推薦碼"
            v-model="form.code"
            :error="errors.code"
            required
          />

          <!-- 同意條款 -->
          <div class="form-group mt-4">
            <div class="agree-row">
              <input id="agree" type="checkbox" v-model="form.agree" />
              <label for="agree">我已閱讀並同意</label>

              <RouterLink to="/terms/platform" class="agree-link" @click.stop
                >平台合約</RouterLink
              >
              <RouterLink to="/terms/service" class="agree-link" @click.stop
                >服務條款</RouterLink
              >
              及
              <RouterLink to="/privacy" class="agree-link" @click.stop
                >隱私權政策</RouterLink
              >
            </div>

            <p class="error-msg" v-if="errors.agree">{{ errors.agree }}</p>
          </div>
        </div>

        <button type="submit" class="btn-confirm">註冊會員</button>
        <div class="links">
          <p>已有帳號？<RouterLink to="/login">登入</RouterLink></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onBeforeUnmount, watch } from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import SharedPassword from "@/components/shared/Shared-Password.vue";

const form = reactive({
  phone: "",
  password: "",
  confirmPassword: "",
  name: "",
  gender: "",
  birthday: "",
  line: "",
  email: "",
  topics: [],
  job: "",
  assetMin: null,
  assetMax: null,
  industry: "",
  idDoc: null,
  assetDoc: null,
  addressDoc: null,
  resumeDoc: null,
  note: "",
  agree: false,
});
const errors = reactive({
  phone: "",
  password: "",
  confirmPassword: "",
  name: "",
  gender: "",
  birthday: "",
  line: "",
  email: "",
  industry: "",
  idDoc: "",
  assetDoc: "",
  addressDoc: "",
  code: "",
  asset: "",
  agree: "",
});

const phoneOtp = reactive({ sent: false, seconds: 0, timer: null });
const emailOtp = reactive({ sent: false, seconds: 0, timer: null });
const state = reactive({ passwordOk: false });
const phoneEnableIf = (v) => /^09\d{8,}$/.test(v);
const emailEnableIf = (v) => {
  const [lhs, rhs] = String(v).split("@");
  return !!lhs && (rhs?.length ?? 0) >= 1;
};

watch([() => state.passwordOk, () => form.password], ([ok]) => {
  errors.password = ok ? "" : "請輸入至少8碼，並包含大小寫、數字與符號。";
});

function startTimer(state, total = 100) {
  if (state.timer) clearInterval(state.timer);
  state.sent = true;
  state.seconds = total;
  state.timer = setInterval(() => {
    state.seconds--;
    if (state.seconds <= 0) {
      clearInterval(state.timer);
      state.timer = null;
      state.seconds = 0;
    }
  }, 1000);
}

function handleRegister() {
  errors.password = state.passwordOk
    ? ""
    : "請輸入至少8碼，並包含大小寫、數字與符號。";
  errors.confirmPassword =
    form.password === form.confirmPassword ? "" : "輸入密碼不相符。";

  if (errors.password || errors.confirmPassword) return;
}

async function sendPhoneOTP() {
  startTimer(phoneOtp, 100);
}

async function resendPhoneOTP() {
  if (phoneOtp.seconds > 0) return;
  startTimer(phoneOtp, 100);
}

async function sendEmailOTP() {
  startTimer(emailOtp, 100);
}
async function resendEmailOTP() {
  if (emailOtp.seconds === 0) startTimer(emailOtp, 100);
}

onBeforeUnmount(() => {
  if (phoneOtp.timer) clearInterval(phoneOtp.timer);
  if (emailOtp.timer) clearInterval(emailOtp.timer);
});
</script>

<style lang="scss" scoped></style>
