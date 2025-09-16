<template>
  <section v-if="mode === 'account'">
    <div class="fs-24">創業計劃管理</div>
    <SharedTabs
      class="mt-05"
      v-model="activeTab"
      :tabs="[
        { label: '申請創業', value: 'apply' },
        { label: '創業進度', value: 'progress' },
        { label: '創業明細', value: 'detail' },
      ]"
    />

    <div v-if="activeTab === 'apply'" class="apply">
      <div class="apply-content">暫無創業計畫</div>
      <button class="apply-btn write mt-3">品牌探索</button>
    </div>
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
    />
  </section>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, reactive, computed, onMounted, watch } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import { statusLabel, statusClass } from "@/utils/status";

import Step1 from "./startup-components/Step1.vue";
import Step2 from "./startup-components/Step2.vue";
import Step3 from "./startup-components/Step3.vue";
import Step4 from "./startup-components/Step4.vue";
import Step5 from "./startup-components/Step5.vue";
import Step6 from "./startup-components/Step6.vue";
import Step7 from "./startup-components/Step7.vue";
import Step8 from "./startup-components/Step8.vue";

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
    maxAmount: "",
    partnerLimit: "",
    expireDate: "",
  },
  step2: { file: null },
  step3: {
    hasStartupExp: "",
    expDesc: "",
    hasDispute: "",
    disputeDesc: "",
    willingDocs: "",
    selfAdv: "",
    resources: "",
    otherResources: "",
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
    maxAmount: "",
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
    q5: "",
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
  if (Object.keys(STEPS).includes(nextStep)) {
    docStep.value = nextStep;
    router.replace({ query: { ...route.query, step: nextStep } });
  }
}

const router = useRouter();
const route = useRoute();
const activeTab = ref("apply");
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
  width: 70%;
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

hr {
  border: 1px solid #dfdfdf;
}
</style>
