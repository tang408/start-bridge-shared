<template>
  <div class="fs-24">基本資料</div>
  <SharedTabs
    v-model="activeTab"
    :tabs="[
      { label: '創業者資料', value: 'founder' },
      { label: '共創者資料', value: 'cofounder' },
    ]"
  />

  <div v-if="activeTab === 'founder'">
    <form @submit.prevent="handleRegister" class="form">
      <div class="form-display">
        <div class="form-group d-grid">
          <label class="mb-2">審核狀態</label>
          <span class="ps-2">{{ getStatusText(formFounder.status) }}</span>
        </div>

        <!-- 連絡電話 -->
        <SharedInput
          id="phone"
          type="tel"
          label="聯絡電話*"
          autocomplete="tel"
          v-model="formFounder.phone"
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
            label="密碼*"
            autocomplete="new-password"
            v-model="formFounder.password"
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
          v-model="formFounder.fullname"
          :error="errFounder.fullname"
          :readonly="ro('fullname')"
          required
        />

        <!-- 性別* -->
        <SharedRadio
            id="gender"
          label="性別*"
          v-model="formFounder.gender"
          :options="[
            { value: 1, text: '男性' },
            { value: 2, text: '女性' },
          ]"
          :disabled="ro('gender')"
          :error="errFounder.gender"
          required
        />

        <!-- 出生年月日* -->
        <SharedBirthday
          id="birthday"
          label="出生年月日*"
          v-model="formFounder.birthday"
          :error="errFounder.birthday"
          :required="true"
          :max="new Date().toISOString().slice(0, 10)"
          :readonly="ro('birthday')"
        />

        <!-- 電子郵件* -->
        <SharedInput
          id="email-display"
          type="email"
          label="電子郵件*"
          autocomplete="email"
          v-model="formFounder.email"
          :error="errFounder.email"
          required
          :readonly="ro('email')"
        />

        <!-- Line* -->
        <SharedInput
          id="line"
          label="Line*"
          v-model="formFounder.line"
          :error="errFounder.line"
          required
          :readonly="ro('line')"
        />

        <!-- 創業預算*(自備款2成)* -->
        <SharedInput
          id="budget"
          label="創業預算*(自備款2成)*"
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
          label="資產證明上傳*"
          v-model="formFounder.assetProof"
          :error="errFounder.assetProof"
          :required="true"
          accept=".pdf,.jpg,.jpeg,.png"
          button-text="重新上傳"
          :account="formFounder.fullname"
          :name="'assetProof'"
          @upload-success="(result) => handleUploadSuccess('assetProof', result)"
          :disabled="ro('assetProof')"

        />

        <!-- 良民證上傳* -->
        <SharedUpload
          id="policeRecord"
          label="良民證上傳*"
          v-model="formFounder.policeRecord"
          :error="errFounder.policeRecord"
          :required="true"
          accept=".pdf,.jpg,.jpeg,.png"
          button-text="重新上傳"
          :account="formFounder.fullname"
          :name="'policeRecord'"
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

        <!-- 推薦碼 -->
        <SharedInput
          id="refCode"
          label="推薦碼"
          v-model="formFounder.refCode"
          :error="errFounder.refCode"
          :readonly="ro('refCode')"
        />

        <!-- 公司名稱 -->
        <SharedInput
          id="companyName"
          label="公司名稱*"
          v-model="formFounder.companyName"
          :error="errFounder.companyName"
          required
          :readonly="ro('companyName')"

        />

        <!-- 公司名稱 -->
        <SharedInput
          id="companyNameEn"
          label="公司名稱"
          v-model="formFounder.companyNameEn"
          :error="errFounder.companyNameEn"
          :readonly="ro('companyNameEn')"

        />

        <!-- 統一編號 -->
        <SharedInput
          id="taxId"
          label="統一編號"
          v-model="formFounder.taxId"
          :error="errFounder.taxId"
          inputmode="numeric"
          maxlength="8"
          pattern="^\d{8}$"
          :readonly="ro('taxId')"

        />

        <!-- 公司 Logo 上傳 -->
        <SharedUpload
          id="companyLogo"
          label="公司Logo"
          v-model="formFounder.companyLogo"
          :error="errFounder.companyLogo"
          accept=".jpg,.jpeg,.png,.gif,.pdf"
          :max-size="10 * 1024 * 1024"
          button-text="重新上傳"
          :account="formFounder.fullname"
          :name="'companyLogo'"
          @upload-success="(result) => handleUploadSuccess('companyLogo', result)"
          :disabled="ro('companyLogo')"

        />

        <!-- 公司標語* -->
        <SharedInput
          id="slogan"
          label="公司標語*"
          v-model="formFounder.slogan"
          :error="errFounder.slogan"
          maxlength="60"
          required
          :readonly="ro('slogan')"

        />

        <!-- 公司簡述* -->
        <SharedInput
          id="companyBrief"
          label="公司簡述*"
          v-model="formFounder.companyBrief"
          :error="errFounder.companyBrief"
          required
          :readonly="ro('companyBrief')"

        />

        <!-- 銀行戶名* -->
        <SharedInput
          id="bankName"
          label="銀行戶名*"
          v-model="formFounder.bankName"
          :error="errFounder.bankName"
          required
          :readonly="ro('bankName')"

        />

        <!-- 銀行帳號* -->
        <SharedInput
          id="bankAccount"
          label="銀行帳號*"
          v-model="formFounder.bankAccount"
          :error="errFounder.bankAccount"
          required
          inputmode="numeric"
          pattern="^[0-9-]{6,20}$"
          :readonly="ro('bankAccount')"

        />

        <!-- 公司詳細介紹 -->
        <SharedTextarea
          id="companyIntro"
          label="公司詳細介紹"
          v-model="formFounder.companyIntro"
          :error="errFounder.companyIntro"
          rows="4"
          :readonly="ro('companyIntro')"

        />

        <!-- 官方連結 / Facebook / Instagram（選填，若填需是有效網址） -->
        <SharedInput
          id="website"
          label="官網連結"
          v-model="formFounder.website"
          :error="errFounder.website"
          inputmode="url"
          :readonly="ro('website')"

        />
        <SharedInput
          id="facebook"
          label="Facebook"
          v-model="formFounder.facebook"
          :error="errFounder.facebook"
          inputmode="url"
          :readonly="ro('facebook')"

        />
        <SharedInput
          id="instagram"
          label="Instagram"
          v-model="formFounder.instagram"
          :error="errFounder.instagram"
          inputmode="url"
          :readonly="ro('instagram')"

        />
        <div class="actions two">
          <button v-if="!isEditing" type="button" class="btn-orange" @click="enableEdit">
            修改以上資料
          </button>
            <button v-if="isEditing" type="sumbit" class="btn-yellow" @click="submitForFounderAndCompany">
              送出審核
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
  <div v-else>
    <form @submit.prevent="handleRegister" class="form">
      <div class="form-display">
        <div class="form-group d-grid">
          <label class="mb-2">審核狀態</label>
          <span class="ps-2">{{ getStatusText(formCo.status) }}</span>
        </div>

        <!-- 連絡電話 -->
        <SharedInput
          id="phone"
          type="tel"
          label="聯絡電話*"
          autocomplete="tel"
          v-model="formCo.phone"
          :error="errCo.phone"
          required
          inputmode="numeric"
          maxlength="10"
          :readonly="ro('phone')"
        />

        <!-- 密碼 + 修改 -->
        <SharedInput
            id="password"
            type="password"
            label="密碼*"
            autocomplete="new-password"
            v-model="formCo.password"
            :error="errCo.password"
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
          v-model="formCo.fullname"
          :error="errCo.fullname"
          required
          :readonly="ro('fullname')"
        />

        <!-- 性別* -->
        <SharedRadio
            id="gender"
          label="性別*"
          v-model="formCo.gender"
          :options="[
            { value: 1, text: '男性' },
            { value: 2, text: '女性' },
          ]"
          :error="errCo.gender"
          required
          :disabled="ro('gender')"

        />

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

        <!-- 出生年月日* -->
        <SharedBirthday
          id="birthday"
          label="出生年月日*"
          v-model="formCo.birthday"
          :error="errCo.birthday"
          :required="true"
          :max="new Date().toISOString().slice(0, 10)"
          :readonly="ro('birthday')"
        />

        <!-- 電子郵件* -->
        <SharedInput
          id="email"
          type="email"
          label="電子郵件*"
          autocomplete="email"
          v-model="formCo.email"
          :error="errCo.email"
          required
          :readonly="ro('email')"
        />

        <!-- Line* -->
        <SharedInput
          id="line-display"
          label="Line*"
          v-model="formCo.line"
          :error="errCo.line"
          required
          :readonly="ro('line')"
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

        <!-- 推薦碼 -->
        <SharedInput
          id="refCode"
          label="推薦碼"
          v-model="formCo.refCode"
          :error="errCo.refCode"
          :readonly="ro('refCode')"
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

        <!-- 最低 & 最高可投入資產 -->
        <SharedInput
          id="asset"
          label="最低可投入資產*"
          v-model="formCo.minBudget"
          :error="errCo.minBudget"
          required
          :readonly="ro('minBudget')"
        />

        <SharedInput
            id="asset"
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
          label="可接受投入參與年限*"
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

        <!-- 創業經驗及工作履歷 -->
        <SharedTextarea
          id="experience"
          label="創業經驗及工作履歷"
          v-model="formCo.experience"
          v-model:public="formCo.experienceIsShow"
          :error="errCo.experience"
          rows="4"
          publicable
          :readonly="ro('experience')"
        />

        <!-- 自我介紹與營運理念 -->
        <SharedTextarea
          id="intro"
          label="自我介紹與營運理念"
          v-model="formCo.intro"
          v-model:public="formCo.introIsShow"
          :error="errCo.intro"
          rows="4"
          publicable
          :readonly="ro('intro')"

        />

        <div class="actions two">
          <button v-if="!isEditing" type="button" class="btn-orange" @click="enableEdit">
            修改以上資料
          </button>
          <button v-if="isEditing" type="sumbit" class="btn-yellow" @click="submitForCoreFounder">
            送出審核
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
import {ref, reactive, onMounted, watch} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import SharedBirthday from "@/components/shared/Shared-Birthday.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import {userApi} from "@/api/modules/user.js";


import { useAuth } from "@/composables/useAuth";
import {fileApi} from "@/api/modules/file.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {cityApi} from "@/api/modules/city.js";
const { isLoggedIn, currentUser } = useAuth();

const isEditing = ref(false);
const editableFields = ref(new Set())
function ro(name) {
  if (!isEditing.value) return true;
  return !editableFields.value.has(name);
}

function handleUploadSuccess(fileType, result) {
  console.log(`${fileType} 上傳成功:`, result);

  const fileId = result.data?.id;
  const fileName = result.data?.displayName || result.data?.name;

  if (fileId) {
    if (fileType === 'idProof') {
      formCo.idProofId = fileId;
      // 如果需要更新 v-model，也要更新這個
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

/** ------- 創業者（founder） state ------- */
const formFounder = reactive({
  status: "",
  phone: "",
  password: "",
  fullname: "",
  gender: "",
  birthday: "",
  email: "",
  line: "1",
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
  refCode: "",
  companyName: "",
  companyNameEn: "",
  taxId: "",
  companyLogo: "",
  companyLogoId: null,
  slogan: "",
  companyBrief: "",
  bankName: "",
  bankAccount: "",
  companyIntro: "",
  website: "",
  facebook: "",
  instagram: "",
});

const formCo = reactive({
  phone: "",
  password: "",
  fullname: "",
  gender: "",
  birthday: "",
  email: "",
  line: "",
  minBudget: 0,
  maxBudget: 0,
  idProofId: 0,
  idProof: "",
  idProofSecondId: 0,
  idProofSecond: "",
  refCode: "",
  work: "",
  asset: 0,
  industryType: "",
  yearLimit: "",
  experience: "",
  intro: "",
  status: 0,
});
// const formFounder = reactive({
//   phone: "0987456123",
//   password: "Abc12345!",
//   fullname: "王小明",
//   gender: "M",
//   birthday: "1992-06-18",
//   email: "demo-founder@example.com",
//   line: "line_demo_001",
//   budget: "800,000",
//   region: "台北市",
//   work: "在職",
//   brand: "顏太煮奶茶",
//   assetProof: "asset-proof-demo.pdf",
//   policeRecord: "police-record-demo.pdf",
//   edu: "國立台灣大學 資工系",
//   expDesc: "曾任前端工程師三年，熟 Vue/Angular/WordPress。",
//   refCode: "INVITE2025",
//   companyName: "星橋創媒股份有限公司",
//   companyNameEn: "Star Bridge Media Co., Ltd.",
//   taxId: "12345678",
//   companyLogo: "logo-demo.png",
//   slogan: "讓創業更輕鬆，讓品牌更靠近。",
//   companyBrief: "我們致力於媒合創業者與品牌方，共創共贏。",
//   bankName: "台灣銀行",
//   bankAccount: "0123-456-789",
//   companyIntro: "公司成立於 2022 年，專注於創業媒合、品牌孵化與經營顧問服務。",
//   website: "https://www.star-bridge.tw",
//   facebook: "https://www.facebook.com/starbridge",
//   instagram: "https://www.instagram.com/starbridge",
// });

const errFounder = reactive(
  Object.fromEntries(Object.keys(formFounder).map((k) => [k, ""]))
);

/** ------- 共創者（cofounder） state ------- */
// const formCo = reactive({
//   phone: "0987654321",
//   password: "XyZ98765!",
//   fullname: "陳小美",
//   gender: "F",
//   birthday: "1995-03-05",
//   email: "demo-co@example.com",
//   line: "line_demo_888",
//   budgetRange: "400000",
//   refCode: "CO2025",
//   work: "自由接案",
//   asset: "最低 30 萬；最高 120 萬",
//   industryCategory: "科技業",
//   yearLimit: "三年",
//   resume: "參與三間新創，主要負責 BD 與營運。",
//   philosophy: "以資料驅動決策，長期主義經營品牌。",
// });
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
      alert(response.message);
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
    } else {
      alert(response.message);
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
    } else {
      alert(response.message);
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
    } else {
      alert(response.message);
    }
  } finally {
    loading.value = false;
  }
}


// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getUserInfo(),
    getProofFiles(),
    getIndustryTypes(),
    getCities()
  ]);
});


watch(userProfile, (newValue) => {
  if (newValue) {
    formFounder.phone = newValue.userInfoData?.account || "";
    formFounder.password = newValue.userInfoData?.password;
    formFounder.fullname = newValue.userInfoData?.name || "";
    formFounder.gender = newValue.userInfoData?.sex;
    formFounder.email = newValue.userInfoData?.email || "";
    formFounder.birthday = newValue.userInfoData?.birthday || "";
    formFounder.line = newValue.userInfoData?.lineId || "";
    formFounder.budget = newValue.userInfoData?.budget || "";
    formFounder.refCode = newValue.userInfoData?.referralCode || "";

    // 從 founderInfoData 獲取其他資料
    formFounder.status = newValue.founderInfoData?.status || "";
    formFounder.work = newValue.founderInfoData?.workStatus || "";
    formFounder.edu = newValue.founderInfoData?.education || "";
    formFounder.expDesc = newValue.founderInfoData?.workExperience || "";
    formFounder.brand = newValue.founderInfoData?.expectIndustryType || "";
    formFounder.region = newValue.founderInfoData?.city || "";
    // 從 companyInfoData 獲取公司資料
    formFounder.companyName = newValue.companyInfoData?.name || "";
    formFounder.companyNameEn = newValue.companyInfoData?.nameEn || "";
    formFounder.taxId = newValue.companyInfoData?.businessId || "";
    formFounder.companyLogo = newValue.companyInfoData?.logoName || "";
    formFounder.companyLogoId = newValue.companyInfoData?.logoId || null;
    formFounder.slogan = newValue.companyInfoData?.slogan || "";
    formFounder.companyBrief = newValue.companyInfoData?.info || "";
    formFounder.bankName = newValue.companyInfoData?.bankAccountName || "";
    formFounder.bankAccount = newValue.companyInfoData?.bankAccountNumber || "";
    formFounder.companyIntro = newValue.companyInfoData?.profile || "";
    formFounder.website = newValue.companyInfoData?.officialUrl || "";
    formFounder.facebook = newValue.companyInfoData?.facebookUrl || "";
    formFounder.instagram = newValue.companyInfoData?.instagramUrl || "";

    // coFounderData
    formCo.status = newValue.coFounderData?.status || "";
    formCo.phone = newValue.userInfoData?.account || "";
    formCo.password = newValue.userInfoData?.password;
    formCo.fullname = newValue.userInfoData?.name;
    formCo.gender = newValue.userInfoData?.sex;
    formCo.birthday = newValue.userInfoData?.birthday || "";
    formCo.email = newValue.userInfoData?.email || "";
    formCo.line = newValue.userInfoData?.lineId || "";
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
    formCo.status = newValue.coreFounderData?.status || "";
  }
}, { immediate: true });



watch(proofFiles, (newValue) => {
  if (newValue) {
    // 根據實際的資料結構來對應
    formFounder.assetProof = newValue.assetsCertification.displayName || "";
    formFounder.assetProofId = newValue.assetsCertification.id || "";
    formFounder.policeRecord = newValue.pcrCertification.displayName || "";
    formFounder.policeRecordId = newValue.pcrCertification.id || "";

    formCo.idProof = newValue.coreFounderIdentityCertification?.displayName || "";
    formCo.idProofId = newValue.coreFounderIdentityCertification?.id || null;
    formCo.idProofSecond = newValue.coreFounderSecondaryCertification?.displayName || "";
    formCo.idProofSecondId = newValue.coreFounderSecondaryCertification?.id || null;
  }
}, { immediate: true });

const activeTab = ref("founder");
const getActiveForm = () =>
  activeTab.value === "founder" ? formFounder : formCo;
const getActiveErrors = () =>
  activeTab.value === "founder" ? errFounder : errCo;

function handleRegister() {
  const form = getActiveForm();
  const errors = getActiveErrors();

  clearFieldErrors(Object.keys(errors));

  if (Object.values(errors).some(Boolean)) return;

  // 提交表單邏輯
  Object.keys(errors).forEach((k) => (errors[k] = ""));

  if (!form.companyName) errors.companyName = "此欄位為必填";
  if (form.taxId && !/^\d{8}$/.test(form.taxId))
    errors.taxId = "統一編號需為 8 碼數字";

  if (Object.values(errors).some(Boolean)) return;
}

function normalizeUrl(v) {
  if (!v) return "";
  const trimmed = String(v).trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
function isValidUrl(v) {
  if (!v) return true;
  try {
    const u = new URL(normalizeUrl(v));
    return !!u.host;
  } catch {
    return false;
  }
}

function clearFieldErrors(keys) {
  const errors = getActiveErrors();
  keys.forEach((k) => (errors[k] = ""));
}

// 或者根據不同的業務需求定義
const alwaysRO = new Set([
  // 身份相關（需要重新驗證才能修改）
  "phone",
  "email",

  // 系統相關（系統生成或管理）
  "refCode",

  // 安全相關
  "password"
]);

// 啟用編輯模式
function enableEdit() {
  isEditing.value = true;

  const allFields = Object.keys(getActiveForm());
  const editableFieldsList = allFields.filter(field => !alwaysRO.has(field));
  editableFields.value = new Set(editableFieldsList);
}

function submitForReview() {
  const form = getActiveForm();
  const errors = getActiveErrors();

  const keys = [
    "companyBrief",
    "bankName",
    "bankAccount",
    "companyIntro",
    "website",
    "facebook",
    "instagram",
  ].filter((k) => k in form && k in errors);
  keys.forEach((k) => (errors[k] = ""));

  if (
    "bankAccount" in form &&
    form.bankAccount &&
    !/^[0-9-]{6,20}$/.test(form.bankAccount)
  ) {
    errors.bankAccount = "請輸入正確帳號（僅數字與 -）";
  }

  ["website", "facebook", "instagram"].forEach((k) => {
    if (k in form && form[k]) {
      const normalized = normalizeUrl(form[k]);
      if (!isValidUrl(normalized)) errors[k] = "網址格式不正確";
      else form[k] = normalized;
    }
  });

  if (Object.values(errors).some(Boolean)) return;
}



async function submitForFounderAndCompany() {
  const formData = {
    userId: currentUser.value,
    name: formFounder.fullname,
    sex: formFounder.gender,
    birthday: formFounder.birthday,
    lineId: formFounder.line,
    email: formFounder.email,
    budget: Number(formFounder.budget),
    city: formFounder.region,
    workStatus: formFounder.work,
    industryType: formFounder.brand,
    assetsCertification: formFounder.assetProofId,
    PCRCertification: formFounder.policeRecordId,
    education: formFounder.edu,
    workExperience: formFounder.expDesc,
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
    status: 0
  }
  console.log(formData)
  const response = await userApi.updateFounderAndCompany(formData);
  if (response.code === 0) {
    alert('送出審核成功');
    isEditing.value = false;
  }
}

async function submitForCoreFounder() {
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
    experienceIsShow: formCo.experienceIsShow ,
    introduce: formCo.intro,
    introduceIsShow: formCo.introIsShow,
    identityCertification: formCo.idProofId,
    secondaryCertification: formCo.idProofSecondId,
    status: 0,
  }
  const response = await userApi.updateCoreFounder(formData);
  if (response.code === 0) {
    alert('送出審核成功');
    isEditing.value = false;
    editableFields.value.clear();
  } else {
    alert(response.message);
  }

}

// 狀態轉換函數
function getStatusText(status) {
  switch (status) {
    case 0:
    case false:
      return '未審核';
    case 1:
    case true:
      return '審核通過';
    case 2:
      return '審核未通過';
    default:
      return '未審核';
  }
}



const passwordDialog = ref(null)
const isUpdating = ref(false)

const newPasswordForm = reactive({
  newPassword: '',
  confirmPassword: '',
  error: ''
})

function onChangePassword() {
  // 清空表單
  newPasswordForm.newPassword = ''
  newPasswordForm.confirmPassword = ''
  newPasswordForm.error = ''
  // 打開 dialog
  passwordDialog.value.showModal()
}

function closeDialog() {
  passwordDialog.value.close()
}

async function handleUpdatePassword() {
  try {
    // 驗證密碼
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

    // 發送 API 請求
    await userApi.updateUserPassword({
      userId: currentUser.value,
      newPassword: newPasswordForm.newPassword
    })

    // 成功後關閉 dialog
    closeDialog()

    // 可以顯示成功訊息
    alert('密碼修改成功')

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
