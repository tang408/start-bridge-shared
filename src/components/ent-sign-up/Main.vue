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
          <SharedBirthday
            id="birthday"
            label="出生年月日*"
            v-model="form.birthday"
            :error="errors.birthday"
            :required="true"
            :max="new Date().toISOString().slice(0, 10)"
          />

          <!-- Line -->
          <SharedInput
            id="line-display"
            label="Line*"
            v-model="form.line"
            :error="errors.line"
            required
          />

          <!-- 電子郵件 + 驗證碼 -->
          <SharedInput
            id="email"
            type="email"
            label="電子郵件*(作為登入帳號使用)"
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

          <!-- 創業題項 -->
          <SharedInput
            id="line"
            label="創業預算*(自備款2成)"
            v-model="form.budget"
            :error="errors.budget"
            required
          />

          <!-- 工作狀況 -->
          <SharedInput id="job" label="工作狀況*" v-model="form.job" required />

          <!-- 最低 & 最高可投入資產 -->
          <SharedInput
            id="asset"
            label="最低可投入資產*"
            v-model="form.minBudget"
            :error="errors.minBudget"
            required
          />

          <SharedInput
              id="asset"
              label="最高可投入資產*"
              v-model="form.maxBudget"
              :error="errors.maxBudget"
              required
          />

          <!-- 預計參與產業 -->
          <SharedSelect
            id="industry"
            label="預計參與產業*"
            placeholder="請選擇"
            v-model="form.industryType"
            :options="[
              ...industryTypesData.map(item => ({ value: item.id, text: item.name }))
            ]"
            :error="errors.industryType"
            required
          />
          <div>
            <SharedUpload
                id="idDoc"
                label="身份證明上傳*"
                accept=".jpg,.jpeg,.png,application/pdf"
                :account="form.phone"
                :name="'idDoc'"
                v-model="form.idDoc"
                :error="errors.idDoc"
                :maxSizeMb="10"
                @invalid="(msg) => (errors.idDoc = msg)"
                @upload-success="(result) => handleUploadSuccess('idDoc', result)"
                :required="true"
            />

            <SharedUpload
                id="assetDoc"
                label="資產證明上傳*"
                accept=".jpg,.jpeg,.png,application/pdf"
                :account="form.phone"
                :name="'assetDoc'"
                v-model="form.assetDoc"
                :error="errors.assetDoc"
                :maxSizeMb="10"
                @invalid="(msg) => (errors.assetDoc = msg)"
                @upload-success="(result) => handleUploadSuccess('assetDoc', result)"
                :required="true"
            />

            <SharedUpload
                id="addressDoc"
                label="良民證上傳*"
                accept=".jpg,.jpeg,.png,application/pdf"
                :account="form.phone"
                :name="'pcrcDoc'"
                v-model="form.pcrcDoc"
                :error="errors.pcrcDoc"
                :maxSizeMb="10"
                @invalid="(msg) => (errors.pcrcDoc = msg)"
                @upload-success="(result) => handleUploadSuccess('pcrcDoc', result)"
                :required="true"
            />
          </div>

          <!-- 推薦碼 -->
          <SharedInput
            id="code"
            label="推薦碼"
            v-model="form.referralCode"
            :error="errors.referralCode"
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

        <button type="submit" class="btn-confirm">註冊申請</button>
        <div class="links">
          <p>已有帳號？<RouterLink to="/login">登入</RouterLink></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {reactive, onBeforeUnmount, watch, onMounted, ref} from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import SharedPassword from "@/components/shared/Shared-Password.vue";
import SharedBirthday from "@/components/shared/Shared-Birthday.vue";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {userApi} from "@/api/modules/user.js";

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
  minBudget: "",
  maxBudget: "",
  industryType: "",
  budget: "",
  referralCode: "",
  idDoc: null,
  assetDoc: null,
  pcrcDoc: null,
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
  industryType: "",
  budget: "",
  idDoc: "",
  assetDoc: "",
  addressDoc: "",
  code: "",
  asset: "",
  agree: "",
  minBudget: "",
  maxBudget: "",
  job: "",
  referralCode: "",
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

const loading = ref(false);
function getFileId(fileObj) {
  if (!fileObj) return null;
  if (typeof fileObj === 'object' && fileObj.id) {
    return fileObj.id;
  }
  return null;
}

function convertGender(gender) {
  return gender === 'male' ? 1 : gender === 'female' ? 2 : 0;
}

async function handleRegister() {
  if (loading.value) return;
  loading.value = true;

  // 未滿18歲 不得註冊
  const today = new Date();
  const birthDate = new Date(form.birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) {
    errors.birthday = '您必須年滿18歲才能註冊';
    loading.value = false;
    return;
  } else {
    errors.birthday = '';
  }

  try {
    // 準備 API 參數
    const params = {
      account: form.phone, // 使用手機號碼作為帳號
      password: form.password,
      name: form.name,
      sex: convertGender(form.gender),
      birthday: form.birthday,
      lineId: form.line,
      email: form.email,
      budget: parseInt(form.budget) || 0,
      workStatus: form.job, // 根據你的 API 需求，可能需要轉換為數字
      minBudget: parseInt(form.minBudget) || 0,
      maxBudget: parseInt(form.maxBudget) || 0,
      expectIndustryType: parseInt(form.industryType) || 0,
      identityCertification: getFileId(form.idDoc),
      assetsCertification: getFileId(form.assetDoc),
      pcrCertification: getFileId(form.pcrcDoc),
      referralCode: form.referralCode || ""
    };

    console.log('提交參數:', params);

    // 調用 API
    const response = await userApi.founderRegister(params);

    if (response.code === 0) {
      // 註冊成功
      alert('註冊申請提交成功！請等待審核。');

    } else {
      // 處理錯誤
      console.error('註冊失敗:', response);
      alert(response.message || '註冊失敗，請稍後再試');
    }

  } catch (error) {
    console.error('註冊過程發生錯誤:', error);
    alert('註冊過程發生錯誤，請稍後再試');
  } finally {
    loading.value = false;
  }
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


const industryTypesData = ref([]);
async function getIndustryTypes() {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
      // 保存完整的資料（包含 id 和 name）
      industryTypesData.value = response.data;
      console.log('獲取的行業類型:', response.data);
    } else {
      throw new Error('API 響應格式錯誤');
    }
}


// 檔案上傳成功處理函數
function handleUploadSuccess(fileType, result) {
  console.log(`${fileType} 上傳成功:`, result);

  // 將檔案 ID 存儲到對應的表單欄位
  const fileId = result.data?.id;
  if (fileId) {
    switch (fileType) {
      case 'idDoc':
        form.idDoc = { ...form.idDoc, id: fileId };
        break;
      case 'assetDoc':
        form.assetDoc = { ...form.assetDoc, id: fileId };
        break;
      case 'pcrcDoc':
        form.pcrcDoc = { ...form.pcrcDoc, id: fileId };
        break;
    }
  }
}




// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getIndustryTypes()
  ]);
});


onBeforeUnmount(() => {
  if (phoneOtp.timer) clearInterval(phoneOtp.timer);
  if (emailOtp.timer) clearInterval(emailOtp.timer);
});
</script>

<style lang="scss" scoped></style>
