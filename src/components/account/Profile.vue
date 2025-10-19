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
      <div class="form-display profile">
        <div class="form-group d-grid">
          <label class="mb-2">審核狀態</label>
          <span class="ps-2">未審核</span>
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
          required
        />

        <!-- 性別* -->
        <SharedRadio
          label="性別*"
          v-model="formFounder.gender"
          :options="[
            { value: 'M', text: '男性' },
            { value: 'F', text: '女性' },
          ]"
          :error="errFounder.gender"
          required
        />

        <!-- 出生年月日* -->
        <SharedBirthday
          id="birthday-display"
          label="出生年月日*"
          v-model="formFounder.birthday"
          :error="errFounder.birthday"
          :required="true"
          :max="new Date().toISOString().slice(0, 10)"
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
        />

        <!-- 創業預算*(自備款2成)* -->
        <SharedInput
          id="budget"
          label="創業預算*(自備款2成)*"
          v-model="formFounder.budget"
          :error="errFounder.budget"
          required
        />

        <!-- 所在區域* -->
        <SharedInput
          id="region"
          label="所在區域*"
          v-model="formFounder.region"
          :error="errFounder.region"
          required
        />

        <!-- 工作狀況* -->
        <SharedInput
          id="work"
          label="工作狀況*"
          v-model="formFounder.work"
          :error="errFounder.work"
          required
        />

        <!-- 預計加盟產業/品牌* -->
        <SharedInput
          id="brand"
          label="預計加盟產業/品牌*"
          v-model="formFounder.brand"
          :error="errFounder.brand"
          required
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
        />

        <!-- 最高學歷/專長背景 -->
        <SharedInput
          id="edu"
          label="最高學歷/專長背景"
          v-model="formFounder.edu"
          :error="errFounder.edu"
        />

        <!-- 工作經驗描述 -->
        <SharedTextarea
          id="expDesc"
          label="工作經驗描述"
          v-model="formFounder.expDesc"
          :error="errFounder.expDesc"
          rows="4"
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
        />

        <!-- 公司名稱 -->
        <SharedInput
          id="companyNameEn"
          label="公司名稱"
          v-model="formFounder.companyNameEn"
          :error="errFounder.companyNameEn"
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
        />

        <!-- 公司標語* -->
        <SharedInput
          id="slogan"
          label="公司標語*"
          v-model="formFounder.slogan"
          :error="errFounder.slogan"
          maxlength="60"
          required
        />

        <!-- 公司簡述* -->
        <SharedInput
          id="companyBrief"
          label="公司簡述*"
          v-model="formFounder.companyBrief"
          :error="errFounder.companyBrief"
          required
        />

        <!-- 銀行戶名* -->
        <SharedInput
          id="bankName"
          label="銀行戶名*"
          v-model="formFounder.bankName"
          :error="errFounder.bankName"
          required
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
        />

        <!-- 公司詳細介紹 -->
        <SharedTextarea
          id="companyIntro"
          label="公司詳細介紹"
          v-model="formFounder.companyIntro"
          :error="errFounder.companyIntro"
          rows="4"
        />

        <!-- 官方連結 / Facebook / Instagram（選填，若填需是有效網址） -->
        <SharedInput
          id="website"
          label="官網連結"
          v-model="formFounder.website"
          :error="errFounder.website"
          inputmode="url"
        />
        <SharedInput
          id="facebook"
          label="Facebook"
          v-model="formFounder.facebook"
          :error="errFounder.facebook"
          inputmode="url"
        />
        <SharedInput
          id="instagram"
          label="Instagram"
          v-model="formFounder.instagram"
          :error="errFounder.instagram"
          inputmode="url"
        />
        <div class="actions two">
          <button type="button" class="btn-orange" @click="saveDraft">
            修改以上資料
          </button>
          <button type="sumbit" class="btn-yellow" @click="submitForReview">
            送出審核
          </button>
        </div>
      </div>
    </form>
  </div>
  <div v-else>
    <form @submit.prevent="handleRegister" class="form">
      <div class="form-display profile">
        <div class="form-group d-grid">
          <label class="mb-2">審核狀態</label>
          <span class="ps-2">未審核</span>
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
        />

        <!-- 性別* -->
        <SharedRadio
          label="性別*"
          v-model="formCo.gender"
          :options="[
            { value: 'M', text: '男性' },
            { value: 'F', text: '女性' },
          ]"
          :error="errCo.gender"
          required
        />

        <!-- 身分證明*（持證件自拍） -->
        <SharedUpload
          id="idProofSelfie"
          label="身分證明*（持證件自拍）"
          v-model="formCo.idProofSelfie"
          :error="errCo.idProofSelfie"
          :required="true"
          accept=".jpg,.jpeg,.png"
          placeholder="檔案名稱.jpg"
          button-text="上傳"
          @invalid="(msg) => (errCo.idProofSelfie = msg)"
        />

        <!-- 第二證件＊（必填） -->
        <SharedUpload
          id="secondId"
          label="第二證件*"
          v-model="formCo.secondId"
          :error="errCo.secondId"
          :required="true"
          accept=".jpg,.jpeg,.png,.pdf"
          placeholder="檔案名稱.jpg"
          button-text="上傳"
          @invalid="(msg) => (errCo.secondId = msg)"
        />

        <!-- 出生年月日* -->
        <SharedBirthday
          id="birthday"
          label="出生年月日*"
          v-model="formCo.birthday"
          :error="errCo.birthday"
          :required="true"
          :max="new Date().toISOString().slice(0, 10)"
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
        />

        <!-- 創業預算*(自備款2成)* -->
        <SharedSelect
          id="industry"
          label="創業預算*(自備款2成)"
          v-model="formCo.industry"
          :options="[
            { value: '200000', text: '200,000' },
            { value: '300000', text: '300,000' },
            { value: '400000', text: '400,000' },
            { value: '500000', text: '500,000' },
            { value: '600000', text: '600,000' },
          ]"
          :error="errCo.industry"
          required
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
        />

        <!-- 最低 & 最高可投入資產 -->
        <SharedInput
          id="asset"
          label="最低 & 最高可投入資產*"
          v-model="formCo.asset"
          :error="errCo.asset"
          required
        />

        <!-- 預計參與產業 -->
        <SharedSelect
          id="industry"
          label="預計參與產業*"
          v-model="formCo.industry"
          :options="[
            { value: '餐飲業', text: '餐飲業' },
            { value: '零售業', text: '零售業' },
            { value: '科技業', text: '科技業' },
            { value: '服務業', text: '服務業' },
            { value: '其他業', text: '其他業' },
          ]"
          :error="errCo.industry"
          required
        />
        <!-- 可接受投入參與年限 -->
        <SharedSelect
          id="industry"
          label="可接受投入參與年限*"
          v-model="formCo.industry"
          :options="[
            { value: '三年', text: '三年' },
            { value: '四年', text: '四年' },
          ]"
          :error="errCo.industry"
          required
          publicable
        />

        <!-- 創業經驗及工作履歷 -->
        <SharedTextarea
          id="companyIntro"
          label="創業經驗及工作履歷"
          v-model="formCo.companyIntro"
          :error="errCo.companyIntro"
          rows="4"
          publicable
        />

        <!-- 自我介紹與營運理念 -->
        <SharedTextarea
          id="companyIntro"
          label="自我介紹與營運理念"
          v-model="formCo.companyIntro"
          :error="errCo.companyIntro"
          rows="4"
          publicable
        />

        <div class="actions two">
          <button type="button" class="btn-orange" @click="saveDraft">
            修改以上資料
          </button>
          <button type="sumbit" class="btn-yellow" @click="submitForReview">
            送出審核
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import SharedBirthday from "@/components/shared/Shared-Birthday.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";

const isEditing = ref(false);
const alwaysRO = new Set(["phone", "email", "refCode"]);
const ro = (name) => !isEditing.value || alwaysRO.has(name);

/** ------- 創業者（founder） state ------- */
const formFounder = reactive({
  phone: "0912345678",
  password: "Abc12345!",
  fullname: "王小明",
  gender: "M",
  birthday: "1992-06-18",
  email: "demo-founder@example.com",
  line: "line_demo_001",
  budget: "800,000",
  region: "台北市",
  work: "在職",
  brand: "顏太煮奶茶",
  assetProof: "asset-proof-demo.pdf",
  policeRecord: "police-record-demo.pdf",
  edu: "國立台灣大學 資工系",
  expDesc: "曾任前端工程師三年，熟 Vue/Angular/WordPress。",
  refCode: "INVITE2025",
  companyName: "星橋創媒股份有限公司",
  companyNameEn: "Star Bridge Media Co., Ltd.",
  taxId: "12345678",
  companyLogo: "logo-demo.png",
  slogan: "讓創業更輕鬆，讓品牌更靠近。",
  companyBrief: "我們致力於媒合創業者與品牌方，共創共贏。",
  bankName: "台灣銀行",
  bankAccount: "0123-456-789",
  companyIntro: "公司成立於 2022 年，專注於創業媒合、品牌孵化與經營顧問服務。",
  website: "https://www.star-bridge.tw",
  facebook: "https://www.facebook.com/starbridge",
  instagram: "https://www.instagram.com/starbridge",
});
const errFounder = reactive(
  Object.fromEntries(Object.keys(formFounder).map((k) => [k, ""]))
);

/** ------- 共創者（cofounder） state ------- */
const formCo = reactive({
  phone: "0987654321",
  password: "XyZ98765!",
  fullname: "陳小美",
  gender: "F",
  birthday: "1995-03-05",
  email: "demo-co@example.com",
  line: "line_demo_888",
  budgetRange: "400000",
  refCode: "CO2025",
  work: "自由接案",
  asset: "最低 30 萬；最高 120 萬",
  industryCategory: "科技業",
  yearLimit: "三年",
  resume: "參與三間新創，主要負責 BD 與營運。",
  philosophy: "以資料驅動決策，長期主義經營品牌。",
  idProofSelfie: "asset-proof-demo.pdf",
  secondId: "asset-proof-demo.pdf",
});
const errCo = reactive(
  Object.fromEntries(Object.keys(formCo).map((k) => [k, ""]))
);

const activeTab = ref("founder");
const getActiveForm = () =>
  activeTab.value === "founder" ? formFounder : formCo;
const getActiveErrors = () =>
  activeTab.value === "founder" ? errFounder : errCo;

function onChangePassword() {}

function handleRegister() {
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
  keys.forEach((k) => (errors[k] = ""));
}

function saveDraft() {
  const form = getActiveForm();
  ["website", "facebook", "instagram"].forEach((k) => {
    if (k in form) form[k] = normalizeUrl(form[k]);
  });
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
</style>
