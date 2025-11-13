<template>
  <div class="fs-24">基本資料</div>
  <SharedTabs
      v-model="activeTab"
      :tabs="[
          {label: '用戶資料', value: 'user'},
      { label: '創業者資料', value: 'founder' },
      { label: '共創者資料', value: 'cofounder' },
    ]"
  />
  <div v-if="activeTab === 'user'">
    <form @submit.prevent="submitForUser" class="form">
      <div class="form-display profile">
        <div class="form-group d-grid">
          <!-- 連絡電話 -->
          <SharedInput
              id="phone"
              type="tel"
              label="聯絡電話*"
              autocomplete="tel"
              v-model="formUser.phone"
              :error="errFounder.phone"
              required
              inputmode="numeric"
              maxlength="10"
              :readonly="ro('phone')"
          />

          <!-- 密碼 + 修改 -->
          <SharedInput
              id="password"
              type="password"
              :showEye="false"
              label="密碼*"
              autocomplete="new-password"
              v-model="formUser.password"
              :error="errFounder.password"
              :readonly="ro('password')"
              :buttonReadonly="false"
              required
              buttonText="修改"
              @button-click="onChangePassword"
          />

          <!-- 姓名 -->
          <SharedInput
              id="fullname"
              label="姓名*"
              v-model="formUser.fullname"
              :error="errFounder.fullname"
              :readonly="ro('fullname')"
              required
          />

          <!-- 性別* -->
          <SharedRadio
              id="gender"
              label="性別*"
              v-model="formUser.gender"
              :options="[
            { value: 1, text: '男性' },
            { value: 2, text: '女性' },
          ]"
              :disabled="true"
              :error="errFounder.gender"
              required
          />

          <!-- 出生年月日* -->
          <SharedBirthday
              id="birthday"
              label="出生年月日*"
              v-model="formUser.birthday"
              :error="errFounder.birthday"
              :required="true"
              :max="new Date().toISOString().slice(0, 10)"
              :disabled="true"
              :readonly="true"
          />

          <!-- 電子郵件* -->
          <SharedInput
              id="email-display"
              type="email"
              label="電子郵件*"
              autocomplete="email"
              v-model="formUser.email"
              :error="errFounder.email"
              required
              :readonly="ro('email')"
          />

          <!-- Line* -->
          <SharedInput
              id="line"
              label="Line"
              v-model="formUser.line"
              :error="errFounder.line"
              required
              :readonly="ro('line')"
          />

          <!-- 推薦碼 -->
          <SharedInput
              id="refCode"
              label="推薦碼"
              v-model="formUser.refCode"
              :error="errFounder.refCode"
              :readonly="ro('refCode')"
          />

          <div class="actions two">
            <button
                v-if="hasChanges"
                type="submit"
                class="btn-yellow"
            >
              確認修改
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- 修改密碼 Dialog -->
    <dialog ref="passwordDialog" class="password-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>修改密碼</h3>
          <button type="button" class="close-btn" @click="closeDialog">&times;</button>
        </div>

        <form @submit.prevent="handleUpdatePassword" class="modal-body">
          <div class="form-group">
            <label for="newPassword">新密碼*</label>
            <input
                id="newPassword"
                type="password"
                v-model="newPasswordForm.newPassword"
                required
                placeholder="請輸入新密碼"
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">確認新密碼*</label>
            <input
                id="confirmPassword"
                type="password"
                v-model="newPasswordForm.confirmPassword"
                required
                placeholder="請再次輸入新密碼"
            />
          </div>
          <p v-if="newPasswordForm.error" class="error-msg">{{ newPasswordForm.error }}</p>

          <div class="modal-footer">
            <button type="submit" class="btn-confirm" :disabled="isUpdating">
              {{ isUpdating ? '更新中...' : '確認修改' }}
            </button>
          </div>
        </form>
      </div>
    </dialog>

  </div>
    <div v-else-if="activeTab === 'founder'">
      <form @submit.prevent="submitForFounderAndCompany" class="form">
        <div class="form-display profile">
          <div class="form-group d-grid">
            <label class="mb-2">審核狀態</label>
            <span class="ps-2">{{ formFounder.status }}</span>
          </div>
          <!-- 創業預算*(自備款2成)* -->
          <SharedInput
              id="budget"
              label="創業預算*(自備款2成)"
              v-model="formFounder.budget"
              :error="errFounder.budget"
              required
              :readonly="ro('budget')"
          />

          <!-- 所在區域* -->
          <SharedSelect
              id="region"
              label="所在區域*"
              v-model="formFounder.region"
              :error="errFounder.region"
              :options="cities.map(city => ({ value: city.id, text: city.name }))"
              required
              :disabled="ro('region')"
          />

          <!-- 工作狀況* -->
          <SharedInput
              id="work"
              label="工作狀況*"
              v-model="formFounder.work"
              :error="errFounder.work"
              required
              :readonly="ro('work')"
          />

          <!-- 預計加盟產業/品牌* -->
          <SharedSelect
              id="brand"
              label="預計加盟產業/品牌*"
              v-model="formFounder.brand"
              :options="industryTypes.map(type => ({ value: type.id, text: type.name }))"
              :error="errFounder.brand"
              required
              :disabled="ro('brand')"
          />

          <!-- 資產證明上傳* -->
          <SharedUpload
              id="assetProof"
              label="資產證明上傳"
              v-model="formFounder.assetProof"
              :error="errFounder.assetProof"
              :required="true"
              accept=".pdf,.jpg,.jpeg,.png"
              button-text="重新上傳"
              :account="formFounder.fullname"
              :name="'assetProof'"
              :max-size-mb="10"
              @upload-success="(result) => handleUploadSuccess('assetProof', result)"
              :disabled="ro('assetProof')"
          />

          <!-- 良民證上傳* -->
          <SharedUpload
              id="policeRecord"
              label="良民證上傳"
              v-model="formFounder.policeRecord"
              :error="errFounder.policeRecord"
              :required="true"
              accept=".pdf,.jpg,.jpeg,.png"
              button-text="重新上傳"
              :account="formFounder.fullname"
              :name="'policeRecord'"
              :max-size-mb="10"
              @upload-success="(result) => handleUploadSuccess('policeRecord', result)"
              :disabled="ro('policeRecord')"
          />

          <!-- 最高學歷/專長背景 -->
          <SharedInput
              id="edu"
              label="最高學歷/專長背景"
              v-model="formFounder.edu"
              :error="errFounder.edu"
              :readonly="ro('edu')"
          />

          <!-- 工作經驗描述 -->
          <SharedTextarea
              id="expDesc"
              label="工作經驗描述"
              v-model="formFounder.expDesc"
              :error="errFounder.expDesc"
              rows="4"
              :readonly="ro('expDesc')"
          />

          <SharedTextarea
              id="intro"
              label="自我介紹"
              v-model="formFounder.introduce"
              v-model:public="errFounder.introduce"
              :error="errCo.intro"
              rows="4"
              :readonly="ro('intro')"
          />

          <div class="actions two">
            <button
                v-if="hasChanges"
                type="submit"
                class="btn-yellow"
            >
              確認修改
            </button>
          </div>
        </div>
      </form>
    </div>

    <div v-else>
      <form @submit.prevent="submitForCoreFounder" class="form">
        <div class="form-display profile">
          <div class="form-group d-grid">
            <label class="mb-2">審核狀態</label>
            <span class="ps-2">{{ formCo.status }}</span>
          </div>

          <!-- 身分證明*（持證件自拍） -->
          <SharedUpload
              id="idProof"
              label="身分證明*（持證件自拍）"
              v-model="formCo.idProof"
              :error="errCo.idProof"
              :required="true"
              accept=".jpg,.jpeg,.png"
              placeholder="檔案名稱.jpg"
              :account="formCo.fullname"
              :name="'idProof'"
              @upload-success="(result) => handleUploadSuccess('idProof', result)"
              button-text="上傳"
              @invalid="(msg) => (errCo.idProof = msg)"
              :disabled="ro('idProof')"
          />

          <!-- 第二證件＊（必填） -->
          <SharedUpload
              id="idProofSecond"
              label="第二證件*"
              v-model="formCo.idProofSecond"
              :error="errCo.idProofSecond"
              :required="true"
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="檔案名稱.jpg"
              button-text="上傳"
              :account="formCo.fullname"
              :name="'idProofSecond'"
              @upload-success="(result) => handleUploadSuccess('idProofSecond', result)"
              @invalid="(msg) => (errCo.idProofSecond = msg)"
              :disabled="ro('idProofSecond')"
          />

          <!-- 創業預算*(自備款2成)* -->
          <SharedInput
              id="asset"
              label="創業預算*(自備款2成)"
              v-model="formCo.asset"
              :error="errCo.asset"
              required
              :readonly="ro('asset')"
          />

          <!-- 工作狀況* -->
          <SharedInput
              id="work"
              label="工作狀況*"
              v-model="formCo.work"
              :error="errCo.work"
              required
              :readonly="ro('work')"
          />

          <!-- 所在區域* -->
          <SharedSelect
              id="region"
              label="所在區域*"
              v-model="formCo.region"
              :error="errFounder.region"
              :options="cities.map(city => ({ value: city.id, text: city.name }))"
              required
              :disabled="ro('region')"
          />

          <!-- 最低 & 最高可投入資產 -->
          <SharedInput
              id="minBudget"
              label="最低可投入資產*"
              v-model="formCo.minBudget"
              :error="errCo.minBudget"
              required
              :readonly="ro('minBudget')"
          />

          <SharedInput
              id="maxBudget"
              label="最高可投入資產*"
              v-model="formCo.maxBudget"
              :error="errCo.maxBudget"
              required
              :readonly="ro('maxBudget')"
          />

          <!-- 預計參與產業 -->
          <SharedSelect
              id="industry"
              label="預計參與產業*"
              v-model="formCo.industryType"
              :options="industryTypes.map(type => ({ value: type.id, text: type.name }))"
              :error="errCo.industryType"
              required
              :disabled="ro('industryType')"
          />

          <!-- 可接受投入參與年限 -->
          <SharedSelect
              id="yearLimit"
              label="可接受投入參與年限"
              v-model="formCo.yearLimit"
              v-model:public="formCo.yearLimitIsShow"
              :options="[
            { value: 1, text: '一年' },
            { value: 2, text: '二年' },
            { value: 3, text: '三年' },
            { value: 4, text: '四年' },
            { value: 5, text: '五年' },
          ]"
              :error="errCo.yearLimit"
              required
              publicable
              :disabled="ro('yearLimit')"
          />

          <!-- 理財經驗 -->
          <SharedTextarea
              id="experience"
              label="理財經驗"
              v-model="formCo.experience"
              v-model:public="formCo.experienceIsShow"
              :error="errCo.experience"
              rows="4"
              publicable
              :readonly="ro('experience')"
          />

          <!-- 自我介紹 -->
          <SharedTextarea
              id="intro"
              label="自我介紹"
              v-model="formCo.intro"
              v-model:public="formCo.introIsShow"
              :error="errCo.intro"
              rows="4"
              publicable
              :readonly="ro('intro')"
          />

          <div class="actions two">
            <button
                v-if="hasChanges"
                type="submit"
                class="btn-yellow"
            >
              確認修改
            </button>
          </div>
        </div>
      </form>

      <!-- 修改密碼 Dialog -->
      <dialog ref="passwordDialog" class="password-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>修改密碼</h3>
            <button type="button" class="close-btn" @click="closeDialog">&times;</button>
          </div>

          <form @submit.prevent="handleUpdatePassword" class="modal-body">
            <div class="form-group">
              <label for="newPassword">新密碼*</label>
              <input
                  id="newPassword"
                  type="password"
                  v-model="newPasswordForm.newPassword"
                  required
                  placeholder="請輸入新密碼"
              />
            </div>
            <div class="form-group">
              <label for="confirmPassword">確認新密碼*</label>
              <input
                  id="confirmPassword"
                  type="password"
                  v-model="newPasswordForm.confirmPassword"
                  required
                  placeholder="請再次輸入新密碼"
              />
            </div>
            <p v-if="newPasswordForm.error" class="error-msg">{{ newPasswordForm.error }}</p>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="closeDialog">取消</button>
              <button type="submit" class="btn-confirm" :disabled="isUpdating">
                {{ isUpdating ? '更新中...' : '確認修改' }}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
</template>

<script setup>
import {ref, reactive, onMounted, watch, onBeforeUnmount} from "vue";
import {onBeforeRouteLeave} from 'vue-router';
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import SharedBirthday from "@/components/shared/Shared-Birthday.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import {userApi} from "@/api/modules/user.js";
import {useAuth} from "@/composables/useAuth";
import {fileApi} from "@/api/modules/file.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {cityApi} from "@/api/modules/city.js";
import {NewAlert} from "@/composables/useAlert.js";

const {isLoggedIn, currentUser, logout} = useAuth();

// 追蹤表單變更
const hasChanges = ref(false);
const originalData = ref(null);

// 唯讀欄位
const alwaysReadOnly = new Set(['phone', 'email', 'refCode', 'password', 'status']);

function ro(name) {
  return alwaysReadOnly.has(name);
}

function handleUploadSuccess(fileType, result) {
  console.log(`${fileType} 上傳成功:`, result);

  const fileId = result.data?.id;
  const fileName = result.data?.displayName || result.data?.name;

  if (fileId) {
    if (fileType === 'idProof') {
      formCo.idProofId = fileId;
      formCo.idProof = {
        name: fileName,
        id: fileId,
        url: result.data?.url
      };
    } else if (fileType === 'idProofSecond') {
      formCo.idProofSecondId = fileId;
      formCo.idProofSecond = {
        name: fileName,
        id: fileId,
        url: result.data?.url
      };
    } else if (fileType === 'assetProof') {
      formFounder.assetProofId = fileId;
      formFounder.assetProof = {
        name: fileName,
        id: fileId,
        url: result.data?.url
      };
    } else if (fileType === 'policeRecord') {
      formFounder.policeRecordId = fileId;
      formFounder.policeRecord = {
        name: fileName,
        id: fileId,
        url: result.data?.url
      };
    } else if (fileType === 'companyLogo') {
      formFounder.companyLogoId = fileId;
      formFounder.companyLogo = {
        name: fileName,
        id: fileId,
        url: result.data?.url
      };
    }
  }
}

/** ------- 用戶（user） state ------- */
const formUser = reactive({
  phone: "",
  password: "",
  fullname: "",
  gender: "",
  birthday: "",
  email: "",
  line: "1",
  refCode: "",
})

/** ------- 創業者（founder） state ------- */
const formFounder = reactive({
  status: 0,
  budget: 0,
  region: "",
  work: "",
  brand: "",
  assetProof: "",
  assetProofId: null,
  policeRecord: "",
  policeRecordId: null,
  edu: "",
  expDesc: "",
  introduce: "",
});

const formCo = reactive({
  minBudget: 0,
  maxBudget: 0,
  idProofId: 0,
  idProof: "",
  idProofSecondId: 0,
  idProofSecond: "",
  refCode: "",
  work: "",
  region: "",
  asset: 0,
  industryType: "",
  yearLimit: "",
  yearLimitIsShow: false,
  experience: "",
  experienceIsShow: false,
  intro: "",
  introIsShow: false,
  status: 0,
});

const errFounder = reactive(
    Object.fromEntries(Object.keys(formFounder).map((k) => [k, ""]))
);

const errCo = reactive(
    Object.fromEntries(Object.keys(formCo).map((k) => [k, ""]))
);

const userProfile = ref(null);
const loading = ref(false);

async function getUserInfo() {
  loading.value = true;
  const formData = {
    userId: currentUser.value
  }

  try {
    const response = await userApi.getUserInfo(formData);
    if (response.code === 0) {
      userProfile.value = response.data;
    } else {
      await NewAlert.show(
          "錯誤",
          "獲取用戶資料失敗，請洽客服人員。",
      );
    }
  } finally {
    loading.value = false;
  }
}

const proofFiles = ref(null);

async function getProofFiles() {
  loading.value = true;
  const formData = {
    userId: currentUser.value
  }

  try {
    const response = await fileApi.getProofFiles(formData);
    if (response.code === 0) {
      proofFiles.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

const industryTypes = ref([]);

async function getIndustryTypes() {
  loading.value = true;
  try {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
      industryTypes.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

const cities = ref([]);

async function getCities() {
  loading.value = true;
  try {
    const response = await cityApi.getCities();
    if (response.code === 0) {
      cities.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

// 深度比較兩個物件是否相等
function isEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // 處理 null/undefined
    if (val1 == null && val2 == null) continue;
    if (val1 == null || val2 == null) return false;

    // 處理物件
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!isEqual(val1, val2)) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
}

// 檢查是否有變更
function checkChanges() {
  if (!originalData.value) return;

  let currentForm, originalForm;

  // 根據不同的 tab 比較不同的表單
  if (activeTab.value === 'user') {
    // 用戶資料只比較基本欄位
    const userFields = ['phone', 'fullname', 'gender', 'birthday', 'email', 'line', 'refCode'];
    currentForm = {};
    originalForm = {};

    userFields.forEach(field => {
      currentForm[field] = formUser[field];
      originalForm[field] = originalData.value.user[field];
    });
  } else if (activeTab.value === 'founder') {
    currentForm = formFounder;
    originalForm = originalData.value.founder;
  } else {
    currentForm = formCo;
    originalForm = originalData.value.cofounder;
  }

  hasChanges.value = !isEqual(currentForm, originalForm);
}

// 儲存原始資料
function saveOriginalData() {
  originalData.value = {
    user: JSON.parse(JSON.stringify(formUser)),
    founder: JSON.parse(JSON.stringify(formFounder)),
    cofounder: JSON.parse(JSON.stringify(formCo))
  };
}
const activeTab = ref("user");

// 監聽表單變更
watch(activeTab, () => {
  checkChanges();
});

watch([formUser, formFounder, formCo], () => {
  checkChanges();
}, { deep: true });

// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getUserInfo(),
    getProofFiles(),
    getIndustryTypes(),
    getCities()
  ]);

  // 資料載入完成後,儲存原始資料
  saveOriginalData();

  // 監聽瀏覽器關閉/重新整理
  window.addEventListener('beforeunload', handleBeforeUnload);
});

// 組件卸載時移除監聽
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

watch(userProfile, (newValue) => {
  if (newValue) {
    formUser.phone = newValue.userInfoData?.account || "";
    formUser.password = newValue.userInfoData?.password;
    formUser.fullname = newValue.userInfoData?.name || "";
    formUser.gender = newValue.userInfoData?.sex;
    formUser.email = newValue.userInfoData?.email || "";
    formUser.birthday = newValue.userInfoData?.birthday || "";
    formUser.line = newValue.userInfoData?.lineId || "";
    formUser.refCode = newValue.userInfoData?.referralCode || "";

    formFounder.status = getStatusText(newValue.founderInfoData?.status) || "";
    formFounder.work = newValue.founderInfoData?.workStatus || "";
    formFounder.edu = newValue.founderInfoData?.education || "";
    formFounder.expDesc = newValue.founderInfoData?.workExperience || "";
    formFounder.introduce = newValue.founderInfoData?.introduce || "";
    formFounder.brand = newValue.founderInfoData?.expectIndustryType || "";
    formFounder.region = newValue.founderInfoData?.city || "";
    formFounder.budget = newValue.userInfoData?.budget || "";


    formCo.status = getCoreStatusText(newValue.coreFounderData?.status) || "";
    formCo.asset = newValue.userInfoData?.budget || 0;

    formCo.refCode = newValue.userInfoData?.referralCode || "";
    formCo.work = newValue.coreFounderData?.workStatus || "";
    formCo.minBudget = newValue.coreFounderData?.minBudget || "";
    formCo.maxBudget = newValue.coreFounderData?.maxBudget || "";
    formCo.industryType = newValue.coreFounderData?.expectIndustryType || "";
    formCo.yearLimit = newValue.coreFounderData?.investLimitYear || "";
    formCo.yearLimitIsShow = newValue.coreFounderData?.investLimitYearIsShow || false;
    formCo.experience = newValue.coreFounderData?.experience || "";
    formCo.experienceIsShow = newValue.coreFounderData?.experienceIsShow || false;
    formCo.intro = newValue.coreFounderData?.introduce || "";
    formCo.introIsShow = newValue.coreFounderData?.introduceIsShow || false;
    formCo.region = newValue.coreFounderData?.city || "";

  }
}, {immediate: true});

watch(proofFiles, (newValue) => {
  if (newValue) {
    formFounder.assetProof = newValue.assetsCertification.displayName || "";
    formFounder.assetProofId = newValue.assetsCertification.id || "";
    formFounder.policeRecord = newValue.pcrCertification.displayName || "";
    formFounder.policeRecordId = newValue.pcrCertification.id || "";

    formCo.idProof = newValue.coreFounderIdentityCertification?.displayName || "";
    formCo.idProofId = newValue.coreFounderIdentityCertification?.id || null;
    formCo.idProofSecond = newValue.coreFounderSecondaryCertification?.displayName || "";
    formCo.idProofSecondId = newValue.coreFounderSecondaryCertification?.id || null;
  }
}, {immediate: true});

async function submitForUser() {
  if (!hasChanges.value) {
    await NewAlert.show(
        "無變更",
        "沒有需要儲存的變更"
    );
    return;
  }
  const result = await NewAlert.confirm('確認', '確定修改資料嗎？');
  if (result) {
    const formData = {
      userId: currentUser.value,
      name: formUser.fullname,
      sex: formUser.gender,
      birthday: formUser.birthday,
      lineId: formUser.line
    }

    const response = await userApi.updateUserInfo(formData);
    if (response.code === 0) {
      await NewAlert.show(
          "修改資料",
          "修改成功" // 傳入內容
      );
      hasChanges.value = false;
      saveOriginalData();
    }
  }

}
async function submitForFounderAndCompany() {
  if (!hasChanges.value) {
    await NewAlert.show(
        "無變更",
        "沒有需要儲存的變更"
    );
    return;
  }

  if (formFounder.region === "") {
    errFounder.region = '請選擇所在區域';
    await NewAlert.show(
        "表單錯誤",
        "請選擇所在區域"
    );
    return;
  }

  if (formFounder.work === "") {
    errFounder.work = '請填寫工作狀況';
    await NewAlert.show(
        "表單錯誤",
        "請填寫工作狀況"
    );
    return;
  }

  if (formFounder.industryType === "") {
    errFounder.brand = '請選擇預計加盟產業/品牌';
    await NewAlert.show(
        "表單錯誤",
        "請選擇預計加盟產業/品牌"
    );
    return;
  }
  const result = await NewAlert.confirm('確認', '確定修改資料嗎？');
  if (result)  {
    const formData = {
      userId: currentUser.value,
      budget: Number(formFounder.budget),
      city: formFounder.region,
      workStatus: formFounder.work,
      industryType: formFounder.brand,
      assetsCertification: formFounder.assetProofId,
      PCRCertification: formFounder.policeRecordId,
      education: formFounder.edu,
      workExperience: formFounder.expDesc,
      introduce: formFounder.introduce,
      companyName: formFounder.companyName,
      companyNameEn: formFounder.companyNameEn,
      businessId: formFounder.taxId,
      logo: formFounder.companyLogoId,
      slogan: formFounder.slogan,
      info: formFounder.companyBrief,
      bankAccountName: formFounder.bankName,
      bankAccountNumber: formFounder.bankAccount,
      profile: formFounder.companyIntro,
      officialUrl: formFounder.website,
      facebookUrl: formFounder.facebook,
      instagramUrl: formFounder.instagram,
    };

    const response = await userApi.updateFounderAndCompany(formData);
    if (response.code === 0) {
      await NewAlert.show(
          "修改資料",
          "送出基本資料審核成功" // 傳入內容
      );
      hasChanges.value = false;
      saveOriginalData();
    }
  }
}

async function submitForCoreFounder() {
  // 檢查必填

  if (!hasChanges.value) {
    await NewAlert.show(
        "無變更",
        "沒有需要儲存的變更"
    );
    return;
  }

  if (formCo.region === "") {
    errCo.region = '請選擇所在區域';
    await NewAlert.show(
        "表單錯誤",
        "請選擇所在區域"
    );
    return;
  }
  const result = await NewAlert.confirm('確認', '確定修改資料嗎？');
  if (result) {
    const formData = {
      userId: currentUser.value,
      name: formCo.fullname,
      sex: formCo.gender,
      birthday: formCo.birthday,
      lineId: formCo.line,
      email: formCo.email,
      budget: Number(formCo.asset),
      workStatus: formCo.work,
      minBudget: Number(formCo.minBudget),
      maxBudget: Number(formCo.maxBudget),
      expectIndustryType: formCo.industryType,
      industryType: formCo.industryType,
      investLimitYear: formCo.yearLimit,
      investLimitYearIsShow: formCo.yearLimitIsShow,
      experience: formCo.experience,
      experienceIsShow: formCo.experienceIsShow,
      introduce: formCo.intro,
      introduceIsShow: formCo.introIsShow,
      identityCertification: formCo.idProofId,
      secondaryCertification: formCo.idProofSecondId,
      city: Number(formCo.region),
    };

    const response = await userApi.updateCoreFounder(formData);
    if (response.code === 0) {
      await NewAlert.show(
          "修改資料",
          "送出資料審核成功"
      );
      hasChanges.value = false;
      saveOriginalData();
    } else {
      await NewAlert.show(
          "錯誤",
          "送出資料失敗，請聯絡客服人員。"
      );
    }
  }
}

// 狀態轉換函數
function getStatusText(status) {
  switch (status) {
    case 0:
      return '無須審核';
    case 1:
      return '創業者資料待審核';
    case 2:
      return '業務初審通過';
    case 3:
      return '審核通過';
    case 4:
      return '審核不通過';
    default:
      return '未審核';
  }
}

function getCoreStatusText(status) {
  switch (status) {
    case 0:
      return '無須審核';
    case 1:
      return '共創者資料待審核';
    case 2:
      return '業務初審通過';
    case 3:
      return '審核通過';
    case 4:
      return '審核不通過';
    default:
      return '未審核';
  }
}

// 處理頁面離開
async function handleBeforeUnload(e) {
  if (hasChanges.value) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
}

// 路由守衛
onBeforeRouteLeave(async (to, from, next) => {
  if (hasChanges.value) {
    const confirmed = confirm('資料已編輯,是否確認儲存修改?');

    if (confirmed) {
      // 根據當前 tab 執行對應的提交函數
      if (activeTab.value === 'user') {
        await submitForUser();
      } else if (activeTab.value === 'founder') {
        await submitForFounderAndCompany();
      } else {
        await submitForCoreFounder();
      }
      next();
    } else {
      hasChanges.value = false;
      next();
    }
  } else {
    next();
  }
});
// 修改密碼相關
const passwordDialog = ref(null)
const isUpdating = ref(false)

const newPasswordForm = reactive({
  newPassword: '',
  confirmPassword: '',
  error: ''
})

function onChangePassword() {
  newPasswordForm.newPassword = ''
  newPasswordForm.confirmPassword = ''
  newPasswordForm.error = ''
  passwordDialog.value.showModal()
}

function closeDialog() {
  passwordDialog.value.close()
}

async function handleUpdatePassword() {
  try {
    if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
      newPasswordForm.error = '密碼確認不一致'
      return
    }

    if (newPasswordForm.newPassword.length < 6) {
      newPasswordForm.error = '密碼長度至少需要6個字元'
      return
    }

    isUpdating.value = true
    newPasswordForm.error = ''

    await userApi.updateUserPassword({
      userId: currentUser.value,
      newPassword: newPasswordForm.newPassword
    })

    closeDialog()
    await NewAlert.show(
      '修改密碼',
      '密碼修改成功，請使用新密碼重新登入。'
    );
    // 登出用戶
    await logout();

  } catch (error) {
    newPasswordForm.error = error.response?.data?.message || '修改密碼失敗'
  } finally {
    isUpdating.value = false
  }
}
</script>

<style lang="scss" scoped>
.actions.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gap-12;
  margin-top: 8px;
}

.btn-orange,
.btn-yellow {
  border: none;
  border-radius: $br-8;
  height: 40px;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
}

.btn-orange {
  background: $btn-orange;
  color: $white;
}

.btn-yellow {
  background: $brand-yellow;
  color: #373a36;
}

.password-modal {
  border: none;
  border-radius: 8px;
  padding: 0;
  max-width: 400px;
  width: 90vw;
}

.password-modal::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel, .btn-confirm {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-confirm {
  background-color: #ff6634;
  color: white;
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  color: #db3838;
  font-size: 13px;
  margin: 10px 0;
}
</style>
