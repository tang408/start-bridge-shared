<template>
  <div class="back-background">
    <div class="back-content container">
      <div class="fs-24">註冊</div>

      <form @submit.prevent="handleRegister" class="form">
        <div class="form-display">
          <SharedInput
              ref="phoneRef"
              id="phone"
              type="tel"
              label="聯絡電話*(作為登入帳號使用)"
              v-model="form.phone"
              :error="errors.phone"
              buttonText="寄送驗證碼"
              @button-click="sendPhoneOTP"
              :sent="phoneOtp.sent"
              :countdown="phoneOtp.seconds"
              @resend="resendPhoneOTP"
              :enable-if="phoneEnableIf"
              inputmode="numeric"
              maxlength="10"
          />

          <SharedInput
              ref="verifyCodeRef"
              id="phoneOtpCode"
              type="text"
              label="手機驗證碼*"
              placeholder="請輸入6位數驗證碼"
              v-model="form.verifyCode"
              :error="errors.verifyCode"
              inputmode="numeric"
              maxlength="6"
          />

          <SharedPassword
              ref="passwordRef"
              id="password"
              type="password"
              label="密碼*"
              v-model="form.password"
              :error="errors.password"
              @valid-change="(ok) => (state.passwordOk = ok)"
          />

          <SharedInput
              ref="confirmPasswordRef"
              id="confirmPassword"
              type="password"
              label="再次輸入密碼*"
              v-model="form.confirmPassword"
              :error="errors.confirmPassword"
          />

          <SharedInput
              ref="nameRef"
              id="name"
              label="姓名*"
              v-model="form.name"
              :error="errors.name"
              hint="請輸入與身份證件（如護照）上完全一致的姓名。"
              @input="handleNameInput"
          />

          <SharedRadio
              ref="genderRef"
              label="性別*"
              v-model="form.gender"
              :options="[
              { value: 'male', text: '男性' },
              { value: 'female', text: '女性' },
            ]"
              :error="errors.gender"
          />

          <SharedBirthday
              ref="birthdayRef"
              id="birthday"
              label="出生年月日*"
              v-model="form.birthday"
              :error="errors.birthday"
              :max="new Date().toISOString().slice(0, 10)"
          />

          <SharedInput
              ref="emailRef"
              id="email"
              type="email"
              label="電子郵件*"
              v-model="form.email"
              :error="errors.email"
          />

          <SharedInput
              id="code"
              label="推薦碼"
              v-model="form.referralCode"
              :error="errors.referralCode"
          />

          <div ref="agreeRef" class="form-group mt-4">
            <div class="agree-row">
              <input id="agree" type="checkbox" v-model="form.agree" />
              <label for="agree">我已閱讀並同意</label>
              <RouterLink to="/terms/platform" target="_blank" class="agree-link">平台聲明</RouterLink>
              <RouterLink to="/terms/service" target="_blank" class="agree-link">服務條款</RouterLink>
              及
              <RouterLink to="/privacy" target="_blank" class="agree-link">隱私權政策</RouterLink>            </div>
            <p class="error-msg" v-if="errors.agree">{{ errors.agree }}</p>
          </div>
        </div>

        <button type="submit" class="btn-confirm">註冊申請</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import {reactive, onBeforeUnmount, watch, onMounted, ref} from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedPassword from "@/components/shared/Shared-Password.vue";
import SharedBirthday from "@/components/shared/Shared-Birthday.vue";
import {userApi} from "@/api/modules/user.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {useRouter} from "vue-router";
import {NewAlert} from "@/composables/useAlert.js";

const form = reactive({
  phone: "",
  verifyCode: "",
  password: "",
  confirmPassword: "",
  name: "",
  gender: "",
  birthday: "",
  line: "",
  email: "",
  referralCode: "",
  agree: false,
});

const errors = reactive({
  phone: "",
  verifyCode: "",
  password: "",
  confirmPassword: "",
  name: "",
  gender: "",
  birthday: "",
  email: "",
  referralCode: "",
  agree: "",
});

const router = useRouter();

// 為每個欄位創建 ref
const phoneRef = ref(null);
const verifyCodeRef = ref(null);
const passwordRef = ref(null);
const confirmPasswordRef = ref(null);
const nameRef = ref(null);
const genderRef = ref(null);
const birthdayRef = ref(null);
const emailRef = ref(null);
const agreeRef = ref(null);

const phoneOtp = reactive({ sent: false, seconds: 0, timer: null });
const state = reactive({ passwordOk: false });
const loading = ref(false);

const phoneEnableIf = (v) => /^09\d{8}$/.test(v);


watch(
  () => form.confirmPassword,
  (newVal) => {
    if (form.password && newVal !== form.password) {
      errors.confirmPassword = "兩次輸入的密碼不一致";
    } else {
      errors.confirmPassword = "";
    }
  }
);

function handleNameInput(event) {
  const value = event.target.value;
  const filtered = value.replace(/[^\u4e00-\u9fa5a-zA-Z\s,]/g, '');

  // 如果輸入了非法字符，顯示提示
  if (value !== filtered) {
    errors.name = '姓名只能包含中文或英文';
  } else {
    errors.name = '';
  }

  form.name = filtered;
}

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

function convertGender(gender) {
  return gender === 'male' ? 1 : gender === 'female' ? 2 : 0;
}

// 滾動到第一個錯誤欄位
function scrollToFirstError(errorRef) {
  if (errorRef?.value?.$el) {
    errorRef.value.$el.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

// 完整的驗證函數
function validateForm() {
  let firstErrorRef = null;
  let isValid = true;

  // 清空所有錯誤
  Object.keys(errors).forEach(key => errors[key] = "");

  // 1. 驗證手機號碼
  if (!form.phone) {
    errors.phone = "請輸入聯絡電話";
    if (!firstErrorRef) firstErrorRef = phoneRef;
    isValid = false;
  } else if (!/^09\d{8}$/.test(form.phone)) {
    errors.phone = "請輸入有效的手機號碼";
    if (!firstErrorRef) firstErrorRef = phoneRef;
    isValid = false;
  }

  // 2. 驗證驗證碼
  if (!form.verifyCode) {
    errors.verifyCode = "請輸入手機驗證碼";
    if (!firstErrorRef) firstErrorRef = verifyCodeRef;
    isValid = false;
  } else if (!/^\d{6}$/.test(form.verifyCode)) {
    errors.verifyCode = "請輸入6位數驗證碼";
    if (!firstErrorRef) firstErrorRef = verifyCodeRef;
    isValid = false;
  }

  // 3. 驗證密碼
  if (!form.password) {
    errors.password = "請輸入密碼";
    if (!firstErrorRef) firstErrorRef = passwordRef;
    isValid = false;
  } else if (!state.passwordOk) {
    errors.password = "請輸入至少8碼，並包含大小寫、數字與符號";
    if (!firstErrorRef) firstErrorRef = passwordRef;
    isValid = false;
  }

  // 4. 驗證確認密碼
  if (!form.confirmPassword) {
    errors.confirmPassword = "請再次輸入密碼";
    if (!firstErrorRef) firstErrorRef = confirmPasswordRef;
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "兩次輸入的密碼不一致";
    if (!firstErrorRef) firstErrorRef = confirmPasswordRef;
    isValid = false;
  }

  // 5. 驗證姓名
  if (!form.name || !form.name.trim()) {
    errors.name = "請輸入姓名";
    if (!firstErrorRef) firstErrorRef = nameRef;
    isValid = false;
  }

  // 6. 驗證性別
  if (!form.gender) {
    errors.gender = "請選擇性別";
    if (!firstErrorRef) firstErrorRef = genderRef;
    isValid = false;
  }

  // 7. 驗證生日
  if (!form.birthday) {
    errors.birthday = "請選擇出生年月日";
    if (!firstErrorRef) firstErrorRef = birthdayRef;
    isValid = false;
  } else {
    // 驗證年齡
    const today = new Date();
    const birthDate = new Date(form.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      errors.birthday = '您必須年滿18歲才能註冊';
      if (!firstErrorRef) firstErrorRef = birthdayRef;
      isValid = false;
    }
  }

  // 8. 驗證電子郵件
  if (!form.email) {
    errors.email = "請輸入電子郵件";
    if (!firstErrorRef) firstErrorRef = emailRef;
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "請輸入有效的電子郵件地址";
    if (!firstErrorRef) firstErrorRef = emailRef;
    isValid = false;
  }

  // 9. 驗證同意條款
  if (!form.agree) {
    errors.agree = "請閱讀並同意相關條款";
    if (!firstErrorRef) firstErrorRef = agreeRef;
    isValid = false;
  }

  // 滾動到第一個錯誤
  if (firstErrorRef) {
    scrollToFirstError(firstErrorRef);
  }

  return isValid;
}

async function handleRegister() {
  if (loading.value) return;

  // 驗證表單
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const params = {
      account: form.phone,
      verifyCode: form.verifyCode,
      password: form.password,
      name: form.name,
      sex: convertGender(form.gender),
      birthday: form.birthday,
      lineId: form.line,
      email: form.email,
      referralCode: form.referralCode || ""
    };

    console.log('提交參數:', params);

    const response = await userApi.founderRegister(params);

    if (response.code === 0) {
      await NewAlert.show("操作成功", "註冊成功，請使用您的帳號密碼登入");
      await router.push('/login');
    } else {
      console.error('註冊失敗:', response);
      await NewAlert.show("註冊失敗", response.message + ' ,註冊失敗，請洽客服人員');
    }

  } catch (error) {
    console.error('註冊過程發生錯誤:', error);
    await NewAlert.show("註冊失敗", "註冊過程發生錯誤，請洽客服人員。");
  } finally {
    loading.value = false;
  }
}

async function sendPhoneOTP() {
  // 驗證手機號碼格式
  if (!phoneEnableIf(form.phone)) {
    errors.phone = "請輸入有效的手機號碼";
    return;
  }

  errors.phone = "";


  try {
    const response = await userApi.sendVerificationCode({ phone: form.phone });
    if (response.code !== 0) {
      await NewAlert.show("注意！", response.message + "，請洽客服人員。");
    } else {
      startTimer(phoneOtp, 100);
    }
  } catch (error) {
    console.error('發送手機驗證碼過程發生錯誤:', error);
    await NewAlert.show("注意！", "發送手機驗證碼過程發生錯誤，請洽客服人員。");
  }
}

async function resendPhoneOTP() {
  if (phoneOtp.seconds > 0) return;
  await sendPhoneOTP();
}

const industryTypesData = ref([]);
async function getIndustryTypes() {
  const response = await industryTypeApi.getIndustryTypes();
  if (response.code === 0) {
    industryTypesData.value = response.data;
    console.log('獲取的行業類型:', response.data);
  }
}

onMounted(async () => {
  await getIndustryTypes();
});

onBeforeUnmount(() => {
  if (phoneOtp.timer) clearInterval(phoneOtp.timer);
});
</script>

<style lang="scss" scoped></style>
