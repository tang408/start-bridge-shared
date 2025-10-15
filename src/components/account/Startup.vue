<template>
  <section v-if="mode === 'account'">
    <div class="fs-24">創業計劃管理</div>
    <SharedTabs
      class="mt-05"
      v-model="activeTab"
      :tabs="[
        { label: '創業進度', value: 'progress' },
        { label: '創業明細', value: 'detail' },
      ]"
    />

    <div v-if="activeTab === 'progress'" class="w-100">
      <article
        v-for="p in progress"
        :key="p.id"
        class="card"
        :class="{ expanded: expandedId === p.id }"
      >
        <button
          type="button"
          class="summary"
          @click="toggle(p.id)"
          :aria-expanded="expandedId === p.id ? 'true' : 'false'"
          :aria-controls="`details-${p.id}`"
        >
          <header class="card-head">
            <span class="status-pill" :class="statusClass(p.status)">
              {{ statusLabel(p.status) }}</span
            >
          </header>

          <div class="title">{{ p.title }}</div>

          <div class="steps-wrap">
            <div class="steps-bar">
              <span
                v-for="n in 8"
                :key="n"
                class="steps-step"
                :class="{ active: n <= p.progressStep }"
              ></span>
            </div>

            <div class="steps-footer mt-3">
              <span class="status">媒合狀態：{{ p.stateText }}</span>
            </div>
          </div>
          <button
              v-if="p.status === 4"
              type="button"
              class="btn-upload"
              @click="handleButtonClick(p)"
          >
            上傳資料
          </button>
          <button
              v-if="p.status === 7"
              type="button"
              class="btn-upload"
              @click="handleButtonClick(p)"
          >
            查看合約並簽名
          </button>
          <button
              v-if="p.status === 13"
              type="button"
              class="btn-upload"
              @click="handleButtonClick(p)"
          >
            上傳合約並支付服務費
          </button>
        </button>
      </article>
    </div>

    <div v-if="activeTab === 'detail'" class="records">
      <div class="toolbar">
        <SharedDropdown
          v-model="recFilter.timeOrder"
          placeholder="依時間排序"
          :options="[
            { label: '新→舊', value: 'desc' },
            { label: '舊→新', value: 'asc' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.action"
          placeholder="依動作排序"
          :options="[
            { label: '全部', value: '' },
            { label: '初次投入', value: '初次投入' },
            { label: '追加投入', value: '追加投入' },
            { label: '退款', value: '退款' },
            { label: '取消', value: '取消' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.status"
          placeholder="依狀態排序"
          :options="[
            { label: '全部', value: '' },
            { label: '成功', value: '成功' },
            { label: '失敗', value: '失敗' },
            { label: '處理中', value: '處理中' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.amountOrder"
          placeholder="依金額排序"
          :options="[
            { label: '不排序', value: '' },
            { label: '高→低', value: 'desc' },
            { label: '低→高', value: 'asc' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.export"
          placeholder="匯出格式"
          :options="[
            { label: 'CSV', value: '1' },
            { label: 'JPG', value: '2' },
          ]"
        />
      </div>

      <div class="table-wrap">
        <table class="records-table">
          <thead>
            <tr>
              <th>時間</th>
              <th>專案名稱</th>
              <th>動作</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in displayedRecords" :key="row.id">
              <td class="table-wrap-date" data-th="時間">{{ row.date }}</td>
              <td class="ellipsis" :title="row.title" data-th="專案名稱">
                {{ row.title }}
              </td>
              <td data-th="動作">{{ row.action }}</td>
              <td data-th="狀態">{{ row.status }}</td>
            </tr>
            <tr v-if="!displayedRecords.length">
              <td colspan="5" class="empty">目前沒有符合條件的紀錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section v-else>
    <div class="fs-24">
      {{ docTitle }}
    </div>
    <component
      :is="currentStepComponent"
      v-model="formData[docStep]"
      :errors="formErrors[docStep]"
      @next="goNext"
      @submit="createPlan"
    />
  </section>

  <SharedModal
  v-model="showReleaseChargeDialog"
  title="支付上架費"
  mode="submit"
  confirmText="確認上傳"
  cancelText="取消"
  :showCancel="true"
  @submit="handleReleaseChargeSubmit"
  >
    <div class="payment-form">
      <div class="form-group">
        <label>支付金額</label>
        <div class="readonly-field">{{ formatAmount(3500) }} 元</div>
      </div>

      <SharedInput
          id="accountLast5"
          label="帳號後五碼*"
          type="text"
          placeholder="請輸入帳號後五碼"
          v-model="paymentForm.accountLast5"
          :error="paymentErrors.accountLast5"
          required
      />

      <SharedUpload
          label="上傳付款憑證*"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="5"
          name="userPaymentProofFile"
          v-model="paymentForm.paymentProofName"
          :error="paymentErrors.paymentProof"
          @upload-success="(result) => handleUploadSuccess('userPaymentProofFile', result)"
          required
          account="currentUser.value" :id="currentUser.value" />
    </div>

  </SharedModal>

  <!-- 支付上傳 Dialog -->
  <SharedModal
      v-model="showPaymentDialog"
      title="上傳支付資料"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handleContractPaymentSubmit"
  >
    <div class="payment-form">
      <div class="form-group">
        <label>支付金額</label>
        <div class="readonly-field">{{ formatAmount(paymentForm.amount) }} 元</div>
      </div>

      <SharedInput
          id="accountLast5"
          label="帳號後五碼*"
          type="text"
          placeholder="請輸入帳號後五碼"
          v-model="paymentForm.accountLast5"
          :error="paymentErrors.accountLast5"
          required
       />

      <SharedUpload
          label="上傳合約*"
          accept=".pdf,.doc,.docx"
          :max-size="10"
          name="planFinalContract"
          v-model="paymentForm.contractFileName"
          :error="paymentErrors.contractFile"
          @upload-success="(result) => handleUploadSuccess('planFinalContract', result)"
          required
       :account="currentUser.value"  :id="currentUser.value"/>

      <SharedUpload
          label="上傳付款憑證*"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="5"
          name="userPaymentProofFile"
          v-model="paymentForm.paymentProofName"
          :error="paymentErrors.paymentProof"
          @upload-success="(result) => handleUploadSuccess('userPaymentProofFile', result)"
          required
       account="currentUser.value" :id="currentUser.value" />
    </div>
  </SharedModal>

  <!-- PDF簽名組件 -->
  <SharedPDFSign
      :mode="'planContract'"
      :contract-data="contractForm"
      :visible="showSignContractDialog"
      @close="showSignContractDialog = false"
      @submit="handleSignatureSubmitted"
  />
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import {ref, reactive, computed, onMounted, watch, nextTick} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import { statusLabel, statusClass } from "@/utils/status";
const { isLoggedIn, currentUser } = useAuth();


import Step1 from "./startup-components/Step1.vue";
import Step2 from "./startup-components/Step2.vue";
import Step3 from "./startup-components/Step3.vue";
import Step4 from "./startup-components/Step4.vue";
import Step5 from "./startup-components/Step5.vue";
import Step6 from "./startup-components/Step6.vue";
import Step7 from "./startup-components/Step7.vue";
import Step8 from "./startup-components/Step8.vue";
import {useAuth} from "@/composables/useAuth.js";
import {planApi} from "@/api/modules/plan.js";
import {stepApi} from "@/api/modules/step.js";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import {userCheckApi} from "@/api/modules/userCheck.js";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {transactionApi} from "@/api/modules/transaction.js";
import SharedPDFSign from "@/components/shared/Shared-PDFSign.vue";

async function handleSignatureSubmitted(result) {
  showSignContractDialog.value = false;

  const formData = {
    planId:paymentForm.planId,
    contractId:result.signContractId,
    userId: currentUser.value,
  }

  const response = await userCheckApi.signContractByUser(formData)
  if (response.code === 0 ) {
    // 更新狀態或進行其他操作
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    alert(response.message || "合約簽名失敗，請稍後再試");
  }

}
const STEPS = {
  step1: Step1,
  step2: Step2,
  step3: Step3,
  step4: Step4,
  step5: Step5,
  step6: Step6,
  step7: Step7,
  step8: Step8,
};
const docStep = ref("step1");
const currentStepComponent = computed(() => STEPS[docStep.value]);
const expandedId = ref(null);

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

const formData = reactive({
  step1: {
    brand: "",
    budget: "",
    selfFund: "",
    totalFunding: "",
    minAmount: "",
    amountRange: 10,
    partnerLimit: "",
    expireDate: "",
  },
  step2: { file: null },
  step3: {
    hasStartupExp: "",
    expDesc: "",
    hasDispute: "",
    disputeDesc: "",
    selfAdv: "",
    resources: "",
    otherResources: "",
    willingDocs: "",
  },
  step4: {
    q1: "",
    q2: {},
    q3: "",
    q4: {},
    q5: { total: "", channels: [] },
    q6: {},
    q7: [],
    q8Location: "",
    q8LocationNote: {},
    q9Location: "",
    q9LocationNote: {},
  },
  step5: {
    prepBudget: [
      { item: "品牌加盟的前期費用", amount: "" },
      { item: "店鋪的裝潢設工程", amount: "" },
      { item: "營運前購置設備費用", amount: "" },
      { item: "開店前採購備貨費用", amount: "" },
      { item: "創業初期營運週轉資金", amount: "" },
      { item: "輔導培訓課程費用", amount: "" },
      { item: "雜項費用", amount: "" },
      { item: "其他（請說明）", amount: "" },
      { item: "總計", amount: "" },
    ],
    costStruct: [
      {
        item: "物料成本",
        percent: "",
        amount: "",
        note: "",
        desc: "(含物料及包材)",
      },
      {
        item: "人事成本",
        percent: "",
        amount: "",
        note: "",
        desc: "(含薪資及勞健保)",
      },
      {
        item: "租金成本",
        percent: "",
        amount: "",
        note: "",
        desc: "(不含押金)",
      },
      {
        item: "經營管理成本",
        percent: "",
        amount: "",
        note: "",
      },
      { item: "其他", percent: "", amount: "", note: "" },
      {
        item: "總計",
        percent: "",
        amount: "",
        note: "",
        desc: "(淨利，不含稅)",
      },
    ],
    rewardAmount: "",
    rewardPercent: "",

    fundNote: "",
    reportOptions: [
      { value: "pos", text: "提供店內 POS 帳號並開啟營業報表權限" },
      { value: "monthly", text: "每月/季 現金流量表，需於次月 15 日前提供" },
      {
        value: "season",
        text: "每季/年度 財務報表，需於當季後次月 15 日前提供",
      },
      { value: "yearly", text: "每年度 資產負債表，需於次年一月底前提供" },
      { text: "其他", value: "other", withInput: true },
    ],
    otherReport: {},
  },
  step6: {
    sharePeriod: "",
    shareCalc: "",
    shareCalcOther: {},
    sharePay: "",
    sharePayOther: {},
    agree: "",
  },
  step8: { agree: "" },
});

const formErrors = reactive({
  step1: {
    brand: "",
    budget: "",
    selfFund: "",
    totalFunding: "",
    minAmount: "",
    amountRange: "",
    partnerLimit: "",
    expireDate: "",
  },
  step2: { file: "" },
  step3: { hasStartupExp: "" },
  step4: {
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5Total: "",
    q5Channels: "",
    q6: "",
    q7: "",
    q8Location: "",
    q9Location: "",
  },
  step5: {
    prepBudget: "",
    targetRevenue: "",
    costStruct: "",
    fundNote: "",
    reportSelected: "",
  },
  step6: {
    sharePeriod: "",
    shareCalc: "",
    sharePay: "",
    agree: "",
  },
  step8: { agree: "" },
});

function goNext(nextStep) {
  console.log("當前步驟:", docStep.value);
  console.log("下一步驟:", nextStep);
  console.log("完整 formData:", formData);

  console.log("Step1 資料:", formData.step1);
  console.log("Step3 資料:", formData.step3);
  console.log("Step4 資料:", formData.step4);
  console.log("Step5 資料:", formData.step5);
  console.log("Step6 資料:", formData.step6);
  console.log("Step8 資料:", formData.step8);


  if (Object.keys(STEPS).includes(nextStep)) {
    docStep.value = nextStep;
    router.replace({ query: { ...route.query, step: nextStep } });
  }
}

const router = useRouter();
const route = useRoute();
const activeTab = ref("progress");
const mode = ref("account");

const docTitle = computed(() => {
  if (docStep.value === "step1") return "創業基本資料";
  if (docStep.value === "step7") return "提交與後續";
  if (docStep.value === "step8") return "創業風險提示與責任聲明";
  return "創業計劃書";
});

function setDocStep(step) {
  if (!Object.keys(STEPS).includes(step)) return;
  docStep.value = step;
  router.replace({ query: { ...route.query, step } });
}

onMounted(() => {
  const qStep = (route.query.step || "").toString();
  if (Object.keys(STEPS).includes(qStep)) {
    docStep.value = qStep;
  } else {
    setDocStep("step1");
  }
});

watch(
  () => route.query.step,
  (val) => {
    const qStep = (val || "").toString();
    if (Object.keys(STEPS).includes(qStep) && qStep !== docStep.value) {
      docStep.value = qStep;
    }
  }
);

watch(
  () => route.query.source,
  (val) => {
    mode.value = val === "business" ? "business" : "account";
  },
  { immediate: true }
);

const progress = ref([
  {
    id: 1,
    status: "applying",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    progressStep: 3,
    stateText: "上傳合約",
    serviceCharge: 5,
  },
]);
const records = reactive([
  {
    id: "rec-1",
    date: "2024-12-03",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    action: "初次投入",
    status: "成功",
  },
  {
    id: "rec-2",
    date: "2024-11-28",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    action: "追加投入",
    status: "處理中",
  },
]);

const recFilter = reactive({
  timeOrder: "",
  action: "",
  status: "",
  export: "",
});

const displayedRecords = computed(() => {
  let list = [...records];
  if (recFilter.action)
    list = list.filter((r) => r.action === recFilter.action);
  if (recFilter.status)
    list = list.filter((r) => r.status === recFilter.status);
  if (recFilter.timeOrder) {
    list.sort((a, b) =>
      recFilter.timeOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }
  return list;
});
function convertFormData(formData, userId) {
  // 字串轉布林值
  function stringToBool(value) {
    return value === "yes" || value === "agree" || value === true;
  }


  // 從 prepBudget 陣列中提取特定項目的金額
  function getBudgetAmount(prepBudget, itemName) {
    const item = prepBudget.find(budget => budget.item === itemName);
    return item ? parseInt(item.amount) || 0 : 0;
  }

  // 從 costStruct 陣列中提取百分比
  function getCostPercent(costStruct, itemName) {
    const item = costStruct.find(cost => cost.item === itemName);
    return item ? parseFloat(item.percent) || 0 : 0;
  }
  function getCostAmount(costStruct, itemName) {
    const item = costStruct.find(cost => cost.item === itemName);
    return item ? parseFloat(item.amount) || 0 : 0;
  }

  function getCostRemark(costStruct, itemName) {
    const item = costStruct.find(cost => cost.item === itemName);
    return item ? (item.note) || "" : "";
  }

  function getReportText(step5) {
    if (!step5.reportSelected) return "";

    // 如果選擇的是 "other"，返回自訂輸入的內容
    if (step5.reportSelected === "other") {
      return `其他: ${step5.otherReport?.other || ""}`;
    }

    // 從 reportOptions 中找到對應的 text
    const selectedOption = step5.reportOptions.find(option => option.value === step5.reportSelected);
    return selectedOption ? selectedOption.text : step5.reportSelected;
  }

  // Q2: 處理 briefingSession - 返回 "是/否 (值)"
  function getBriefingSessionText(q2) {
    if (!q2) return "";

    if (q2.yes?.checked) {
      return `是 (${q2.yes.value || ""})`;
    } else if (q2.plan?.checked) {
      return `否 (${q2.plan.value || ""})`;
    }
    return "";
  }

  // Q4: 處理 recruitmentMethods - 返回 "key: value" 格式
  function getRecruitmentMethodsText(q4) {
    if (!q4) return "";

    // 對應的文字描述
    const recruitmentMapping = {
      'founder': '本人親自參與經營',
      'family': '邀約親友加入',
      'recruit': '另行招募',
      'other': '其他'
    };

    const result = [];
    for (const [key, value] of Object.entries(q4)) {
      if (value.checked) {
        const text = recruitmentMapping[key] || key;
        if (value.value) {
          result.push(`${text}: ${value.value}`);
        } else {
          result.push(text);
        }
      }
    }
    return result.join(", ");
  }

  // Q5.channels: 轉換為對應的 text
  function getChannelsText(channels) {
    if (!channels) return "";

    const channelMapping = {
      'jobBank': '人力銀行',
      'social': '社群平台',
      'referral': '親友介紹',
      'poster': '門店張貼',
      'other': '其他'
    };

    const result = [];
    for (const [key, value] of Object.entries(channels)) {
      if (value.checked) {
        const text = channelMapping[key] || key;
        if (key === 'other' && value.value) {
          result.push(`${text}: ${value.value}`);
        } else {
          result.push(text);
        }
      }
    }
    return result.join(", ");
  }

  // Q6: 處理時間 - 返回 "text from-to" 格式
  function getTimeText(q6) {
    if (!q6) return "";

    const timeMapping = {
      'fulltime': '全職投入並同步參與經營',
      'parttime': '全職投入但隨機參與經營',
      'other': '其他'
    };

    for (const [key, value] of Object.entries(q6)) {
      if (value.checked) {
        const text = timeMapping[key] || key;
        if (key === 'other' && value.value) {
          return `${text}: ${value.value}`;
        } else if (value.from && value.to) {
          return `${text} ${value.from}-${value.to}`;
        }
        return text;
      }
    }
    return "";
  }

  // Q7: 轉換客戶來源為 text
  function getCustomerSourceText(q7) {
    if (!q7) return "";

    const sourceMapping = {
      'social': '親友推薦',
      'passenger': '過路散客',
      'business': '商圈經營',
      'web': '網路口碑',
      'other': '其他'
    };

    const result = [];
    for (const [key, value] of Object.entries(q7)) {
      if (value.checked) {
        const text = sourceMapping[key] || key;
        if (key === 'other' && value.value) {
          result.push(`${text}: ${value.value}`);
        } else {
          result.push(text);
        }
      }
    }
    return result.join(", ");
  }

  // Q8: 轉換門市地點為 text
  function getLocationTypeText(location, locationNote) {
    const locationMapping = {
      'core': '核心商圈',
      'residential': '住家型商圈',
      'office': '辦公型商圈',
      'school': '學校周邊',
      'mall': '百貨商場',
      'other': '其他'
    };

    const text = locationMapping[location] || location || "";

    // 如果是 "其他" 且有額外說明
    if (location === 'other' && locationNote?.other) {
      return `${text}: ${locationNote.other}`;
    }

    return text;
  }

  // Q9: 轉換共創者附加價值為 text
  function getCoFounderValueText(value, valueNote) {
    const valueMapping = {
      'operation': '協助經營',
      'network': '推廣親友及資源',
      'sales': '協助行銷',
      'finance': '能協助籌資',
      'independent': '獨立經營',
      'other': '其他'
    };

    const text = valueMapping[value] || value || "";

    // 如果是 "其他" 且有額外說明
    if (value === 'other' && valueNote?.other) {
      return `${text}: ${valueNote.other}`;
    }

    return text;
  }

  // 處理分潤週期 - 返回對應的 text
  function getProfitCycleText(value) {
    const cycleMapping = {
      'monthly': '每月結算並分潤一次(每一個月)',
      'quarterly': '每季結算並分潤一次(每三個月)',
      'halfyear': '每半年結算並分潤一次(每六個月)',
      'yearly': '每年結算並分潤一次(每十二個月)'
    };

    return cycleMapping[value] || value || "";
  }

  // 處理分潤計算方式 - 返回對應的 text，特別處理 "其他"
  function getProfitCalcText(value, otherData) {
    if (value === "other") {
      // 處理多種可能的資料結構
      const otherText = otherData?.withInputText || otherData?.other || "";
      return `其他: ${otherText}`;
    }

    if (value === "agree") {
      return "同意依照【共同創業者】出資占比計算淨利分潤(例如:出資 20 萬/總投資 100 萬 = 分潤 20%)";
    }

    return value || "";
  }

  // 處理分潤支付方式 - 返回對應的 text，特別處理 "其他"
  function getProfitPayText(value, otherData) {
    if (value === "other") {
      // 處理多種可能的資料結構
      const otherText = otherData?.withInputText || otherData?.other || "";
      return `其他: ${otherText}`;
    }

    if (value === "bank") {
      return "銀行匯款至指定帳戶(需提供匯款憑證備查)";
    }

    return value || "";
  }


  const step1 = formData.step1;
  const step3 = formData.step3;
  const step4 = formData.step4;
  const step5 = formData.step5;
  const step6 = formData.step6;

  return {
    userId: userId,
    views: 0, // 初始值

    // 基本資料 (Step1)
    startupBudget: parseInt(step1.budget) || 0,
    selfPreparedFunds: parseInt(step1.selfFund) || 0,
    totalAmount: parseInt(step1.totalFunding) || 0,
    minimumAmount: parseInt(step1.minAmount) || 0,
    amountRange: parseInt(step1.amountRange) || 0,
    limitPartner: parseInt(step1.partnerLimit) || 0,
    brand: parseInt(step1.brand) || 0,
    endTime: step1.expireDate,

    // 創業經驗 (Step3)
    hasExperience: stringToBool(step3.hasStartupExp),
    experienceDetails: step3.expDesc || "",
    financialConstraints: stringToBool(step3.hasDispute),
    constraintsExplanation: step3.disputeDesc || "",
    advantageExplanation: step3.selfAdv || "",
    availableResources: step3.resources || "",
    otherResources: step3.otherResources || "",
    supportDocumentation: stringToBool(step3.willingDocs),

    // 創業計畫 (Step4)
    innovationDescription: step4.q1,
    // radio + 字串
    briefingSession: getBriefingSessionText(step4.q2) || "",
    nextStagePlan: step4.q3 || "",
    // 複選 + 字串
    recruitmentMethods: getRecruitmentMethodsText(step4.q4) || "",
    // 招聘人數
    expectedNumberPeople: parseInt(step4.q5.total?.value) || 0,
    // 渠道
    recruitmentPipeline: getChannelsText(step4.q5.channels),
    // text + q6
    investTime: getTimeText(step4.q6) || "",
    // 客源
    customerSource: getCustomerSourceText(step4.q7) || "",
    // 門市屬性
    storeLocationType: getLocationTypeText(step4.q8Location, step4.q8LocationNote) || "",
    // 共創者附加價值
    coFounderAddedValue: getCoFounderValueText(step4.q9Location, step4.q9LocationNote) || "",

    // 財務規劃 (Step5) - 預算項目
    franchiseFee: getBudgetAmount(step5.prepBudget, "品牌加盟的前期費用"),
    decorationCosts: getBudgetAmount(step5.prepBudget, "店鋪的裝潢設工程"),
    equipmentCosts: getBudgetAmount(step5.prepBudget, "營運前購置設備費用"),
    firstMaterialCost: getBudgetAmount(step5.prepBudget, "開店前採購備貨費用"),
    paySalaryBudget: getBudgetAmount(step5.prepBudget, "創業初期營運週轉資金"),
    otherPersonnelCosts: getBudgetAmount(step5.prepBudget, "輔導培訓課程費用"),
    marketingExpenses: getBudgetAmount(step5.prepBudget, "雜項費用"),
    otherCosts: getBudgetAmount(step5.prepBudget, "其他（請說明）"),

    // 財務規劃 (Step5) - 營業目標和成本結構
    turnoverTarget: parseInt(step5.targetRevenue) || 0,
    firstMaterialCostsPercent: getCostPercent(step5.costStruct, "物料成本"),
    firstMaterialCostsAmount: getCostAmount(step5.costStruct, "物料成本"),
    firstMaterialCostsRemark: getCostRemark(step5.costStruct, "物料成本"),
    personnelCostsPercent: getCostPercent(step5.costStruct, "人事成本"),
    personnelCostsAmount: getCostAmount(step5.costStruct, "人事成本"),
    personnelCostsRemark: getCostRemark(step5.costStruct, "人事成本"),
    rentalCostsPercent: getCostPercent(step5.costStruct, "租金成本"),
    rentalCostsAmount: getCostAmount(step5.costStruct, "租金成本"),
    rentalCostsRemark: getCostRemark(step5.costStruct, "租金成本"),
    peratingCostsPercent: getCostPercent(step5.costStruct, "經營管理成本"),
    peratingCostsAmount: getCostAmount(step5.costStruct, "經營管理成本"),
    peratingCostsRemark: getCostRemark(step5.costStruct, "經營管理成本"),
    otherCostsPercent: getCostPercent(step5.costStruct, "其他"),
    otherCostsAmount: getCostAmount(step5.costStruct, "其他"),
    otherCostsRemark: getCostRemark(step5.costStruct, "其他"),

    rewardThreshold: parseInt(step5.rewardAmount) || 0,
    rewardPercent: parseFloat(step5.rewardPercent) || 0,
    otherStatement: getReportText(step5),

    // 合作條件 (Step6)
    profitDistributionCycle: getProfitCycleText(step6.sharePeriod),
    profitCalculationMethod: getProfitCalcText(step6.shareCalc, step6.shareCalcOther),
    profitPaymentMethod: getProfitPayText(step6.sharePay, step6.sharePayOther)  };
}

async function createPlan() {
  const data = convertFormData(formData, currentUser.value)
  const response = await planApi.createPlan(data)
  if (response.code === 0) {
    alert("創業計劃書提交成功！")
  } else {
    alert("創業計劃書提交失敗，請稍後再試。")
    return;
  }
}

const userPlanStepData = ref([])
async function getAllPlanStep() {
  const formData = {
    userId: currentUser.value,
  }
  const response = await stepApi.getAllPlanStep(formData)
  userPlanStepData.value = response.data
}

async function getAllPlanByUser() {
  const formData = {
    userId: currentUser.value,
  }
  const response = await planApi.getAllPlanByUser(formData)
  console.log(response)

if (response.code === 0) {
    progress.value = response.data.map(plan => ({
      id: plan.planId,
      status: plan.currentStep,
      title: plan.planName,
      progressStep: changeProgressStep(plan.currentStep),
      serviceCharge: plan.serviceCharge ,
      stateText: userPlanStepData.value.find(step => step.id === plan.currentStep)?.userStep || "無進度",
    }))
  } else {
    alert("取得創業計劃書列表失敗，請稍後再試。")
    return;
  }
}


// Dialog 顯示狀態
const showReleaseChargeDialog = ref(false);
const showSignContractDialog = ref(false);
const showPaymentDialog = ref(false);

// 表單資料
const paymentForm = reactive({
  planId: null,
  userId: null,
  accountLast5: '',
  amount: 0,
  contractFile: null,
  paymentProof: null,
  contractFileName: '',
  paymentProofName: ''
});

const contractForm = reactive({
  id:null,
  displayName:'',
  salesContractUrl:''
});

// 錯誤訊息
const paymentErrors = reactive({
  contractFile: '',
  paymentProof: '',
  accountLast5: ''
});

// 格式化金額
function formatAmount(amount) {
  return amount?.toLocaleString('zh-TW') || '0';
}

// 處理按鈕點擊，打開 Dialog
async function handleButtonClick(plan) {
  // 設置表單資料
  paymentForm.planId = plan.id;
  paymentForm.userId = currentUser.value;
  paymentForm.amount = plan.serviceCharge;
  paymentForm.contractFile = 0;
  paymentForm.contractFileName = '';
  paymentForm.paymentProof = 0;
  paymentForm.paymentProofName = ''

  // 清空錯誤訊息
  paymentErrors.contractFile = '';
  paymentErrors.paymentProof = '';
  paymentErrors.accountLast5 = '';

  // 顯示 Dialog
  if (plan.status === 4) {
    showReleaseChargeDialog.value = true;
    return;
  }
  if (plan.status === 7) {
    const formData = {
      planId: plan.id,
      userId: currentUser.value,
    }
    const response = await planApi.getSalesContractByPlanUser(formData)
    if (response.code === 0) {
      contractForm.id = response.data.id
      contractForm.displayName = response.data.displayName
      contractForm.salesContractUrl = response.data.salesContractUrl
    }
    // 延遲一下再顯示對話框，確保資料已更新
    await nextTick();
    showSignContractDialog.value = true;
  }
  if (plan.status === 13) {
    showPaymentDialog.value = true;
  }

}

// 驗證表單

function validateReleaseChargePaymentForm() {
  let isValid = true;

  if (!paymentForm.paymentProof) {
    paymentErrors.paymentProof = '請上傳付款憑證';
    isValid = false;
  } else {
    paymentErrors.paymentProof = '';
  }

  if (!paymentForm.accountLast5 || !/^\d{5}$/.test(paymentForm.accountLast5)) {
    paymentErrors.accountLast5 = '請輸入正確的帳戶後五碼';
    isValid = false;
  } else {
    paymentErrors.accountLast5 = '';
  }

  return isValid;
}
function validatePaymentForm() {
  let isValid = true;

  if (!paymentForm.contractFile) {
    paymentErrors.contractFile = '請上傳合約';
    isValid = false;
  } else {
    paymentErrors.contractFile = '';
  }

  if (!paymentForm.paymentProof) {
    paymentErrors.paymentProof = '請上傳付款憑證';
    isValid = false;
  } else {
    paymentErrors.paymentProof = '';
  }

  if (!paymentForm.accountLast5 || !/^\d{5}$/.test(paymentForm.accountLast5)) {
    paymentErrors.accountLast5 = '請輸入正確的帳戶後五碼';
    isValid = false;
  } else {
    paymentErrors.accountLast5 = '';
  }

  return isValid;
}

async function handleReleaseChargeSubmit() {
  if (!validateReleaseChargePaymentForm()) {
    return;
  }
    const formData = {
      planId: paymentForm.planId,
      userId: paymentForm.userId,
      accountLast5: paymentForm.accountLast5,
      amount: 3500,
      paymentProof: paymentForm.paymentProof
    }

    const response = await userCheckApi.createReleaseChargeInfoByUser(formData)

    if (response.code === 0) {
      alert('成功');
      showReleaseChargeDialog.value = false;
      await getAllPlanByUser()
    } else {
      alert(response.message || '上傳失敗');
    }
}

// 提交表單
async function handleContractPaymentSubmit() {
  console.log(paymentForm)
  if (!validatePaymentForm()) {
    return;
  }

  try {
    const formData = {
      planId: paymentForm.planId,
      userId: paymentForm.userId,
      accountLast5: paymentForm.accountLast5,
      amount: paymentForm.amount,
      contractFile: paymentForm.contractFile,
      paymentProof: paymentForm.paymentProof
    }

    console.log(formData)
    // 調用你的 API
    const response = await userCheckApi.createContractPaymentInfoByUser(formData);
    // console.log(response)

    if (response.code === 0) {
      alert('成功');
      showPaymentDialog.value = false;
      await getAllPlanByUser()
    } else {
      alert(response.message || '上傳失敗');
    }
  } catch (error) {
    console.error('上傳失敗:', error);
    alert('上傳失敗，請稍後再試');
  }
}

function changeProgressStep(currentStep) {
  // 申請中
  if (currentStep < 3) {
    return 1
  }

  // 審核中
  if (currentStep = 3) {
    return 2
  }

  // 上架費用 + 上傳合約資料
  if (currentStep >= 4 && currentStep < 7) {
      return 3
  }

  // 審核中
  if (currentStep >= 7 && currentStep < 10) {
    return 4
  }

  // 準備上架
  if (currentStep >= 10 && currentStep < 14) {
    return 5
  }

  if(currentStep >= 14 && currentStep < 17) {
    return 6
  }

  if (currentStep >= 17 && currentStep < 22 )
  {
    return 7
  }

  if (currentStep >= 22) {
    return 8
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    getAllPlanStep()
    getAllPlanByUser()
  }
})

function handleUploadSuccess(fileType, result) {
  const fileId = result.data?.id;
  const fileName = result.data?.displayName || result.data?.name;
  console.log(result)
  if (fileId) {
    if (fileType === 'planFinalContract') {
      paymentForm.contractFile = fileId;
      paymentForm.contractFileName = fileName;
    } else if (fileType === 'userPaymentProofFile') {
      paymentForm.paymentProof = fileId;
      paymentForm.paymentProofName = fileName;
    }
  }
}


watch(activeTab, (newTab) => {
  if (newTab === 'detail' && isLoggedIn.value) {
   getTransactionByUser()
  }
});

const transactionsData = ref([]);
async function getTransactionByUser() {
  const formData = {
    userId: currentUser.value,
  }

  try {
    const response = await transactionApi.getTransactionByUser(formData)

    if (response.code === 0) {
      // 清空原有資料
      records.splice(0, records.length)

      // 處理並填入新資料
      const processedData = response.data.map(record => ({
        id: `rec-${record.id}`,
        date: record.date,
        title: record.planName,
        action: actionMap[record.action] || '未知操作',
        status: statusMap[record.status] || '未知狀態'
      }))

      // 填入新資料
      records.push(...processedData)

      console.log('處理後的交易記錄:', records)
    } else {
      alert("取得交易紀錄失敗，請稍後再試。")
    }
  } catch (error) {
    console.error('取得交易紀錄錯誤:', error)
    alert("取得交易紀錄失敗，請稍後再試。")
  }
}

// 對應表
const actionMap = {
  1: '初次投入',
  2: '追加投入',
  3: '退出'
}

const statusMap = {
  1: '處理中',
  2: '成功',
  3: '失敗'
}

</script>

<style lang="scss" scoped>
.apply {
  width: 380px;
  @media (max-width: 576px) {
    width: 100%;
  }
}

.card {
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 20px;
  padding: 30px;
  transition: box-shadow 0.2s ease, transform 0.1s ease, background 0.2s ease;
  gap: 20px;
  @media (max-width: 576px) {
    padding: 20px;
  }
}

.summary {
  gap: 20px;
  display: inline-grid;
  text-align: start;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  padding: 6px 4px 12px;
  border-radius: 22px;
  &:focus-visible {
    outline: 2px solid #ffcc41;
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  @media (max-width: 576px) {
    display: inline-flex;
    flex-flow: wrap;
    gap: 5px;
  }
}

.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-weight: 400;
  font-size: $fs-14;
  line-height: 17px;
  &.applying {
    background: $btn-yellow;
    color: $white;
  }
}

.title {
  color: $text-deep;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
}

.steps-wrap {
  position: relative;
  background: #fff;
  margin-bottom: 2px;
  width: 80%;
  @media (max-width: 576px) {
    width: 100%;
  }
}

.steps-bar {
  display: flex;
  gap: 6px;
  margin-top: 8px;

  .steps-step {
    flex: 1;
    height: 20px;
    background-color: $gray;
    border-radius: 5px;
    @media (max-width: 576px) {
      height: 10px;
    }
    &.active {
      background-color: $btn-yellow;
    }
  }
}
.steps-footer {
  display: flex;
  justify-content: space-between;
  @media (max-width: 576px) {
    display: grid;
    gap: 5px;
  }
}

.records {
  width: 100%;
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin: 12px 0 16px;

    .btn-export {
      margin-left: auto;
      border: 1px solid #e9ece8;
      background: #fff;
      padding: 8px 14px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      line-height: 1;
      transition: background 0.15s ease, box-shadow 0.15s ease;
      &:hover {
        background: #fff7ef;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      }
    }
  }

  .records-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .records-table thead th {
    text-align: left;
    font-weight: 400;
    font-size: 15px;
    line-height: 140%;
    color: #555555;
    padding: 10px 6px;
  }

  .records-table tbody td {
    padding: 10px 6px;
    border-top: 1px solid #eaeaea;
    vertical-align: middle;
    font-weight: 400;
    font-size: 14px;
    line-height: 140%;
    color: #555555;
    @media (max-width: 576px) {
      border-top: none;
      border-bottom: 1px solid #eaeaea;
    }
  }

  .table-wrap-date {
    letter-spacing: 2px;
  }
  .records-table .ta-right {
    text-align: start;
  }

  .records-table .ellipsis {
    max-width: 380px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .records-table .empty {
    text-align: center;
    color: #9aa39d;
    padding: 28px 0;
  }
}

.records .dropdown-btn {
  min-width: 160px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #e9ece8;
  background: #fff;
  font-weight: 600;
  line-height: 1;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.records .dropdown.open .dropdown-btn,
.records .dropdown-btn:hover {
  background: #fff7ef;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

@media (max-width: 576px) {
  .records .toolbar {
    gap: 10px;
    .btn-export {
      width: 100%;
      margin-left: 0;
    }
  }
  .records .table-wrap {
    padding: 0;
  }

  .records-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 12px;
  }

  thead {
    display: none;
  }
  .records .records-table tbody td {
    font-size: 14px;
  }
  .records .records-table .ellipsis {
    max-width: 100%;
  }
  tbody {
    gap: 10px;
    display: grid;
  }

  tbody tr {
    display: grid;
    grid-template-columns: 1fr;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    padding: 14px 16px;
    border: 1px solid #eee;
  }
  tbody td {
    display: grid;
    grid-template-columns: 88px 1fr;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-top: 0;
    font-size: 15px;

    &::before {
      content: attr(data-th);
      color: $text-dark;
      font-size: 13px;
      line-height: 1;
    }
  }
  tbody tr td:last-child {
    border-bottom: none !important;
  }

  .ellipsis {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .records-table .empty {
    background: transparent;
    border: 0;
    box-shadow: none;
    padding: 24px 0;
  }
}

.btn-upload {
  background: #ff6634;
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-top: 5px;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ff7f50;
  }
}

hr {
  border: 1px solid #dfdfdf;
}
</style>
