<template>
  <div class="fs-24">專案管理系統</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="projectFilter.dateOrder"
        placeholder="依成立日期排序"
        :options="[
          { label: '新→舊', value: 'desc' },
          { label: '舊→新', value: 'asc' },
        ]"
      />

      <SharedDropdown
        v-model="projectFilter.city"
        placeholder="依所在地區排序"
        :options="[
          { label: '全部', value: '' },
          ...cities.map((city) => ({ label: city.name, value: city.name }))
        ]"
      />

      <SharedDropdown
        v-model="projectFilter.status"
        placeholder="依專案進度排序"
        :options="[
          { label: '全部', value: '' },
          ...planSteps.map((step) => ({ label: step.step, value: step.step }))
        ]"
      />
    </div>

    <SharedTable
      :columns="columns"
      :rows="displayedProjects"
      empty-text="目前沒有符合條件的專案"
    >
      <template #name="{ value }">
        <span class="ellipsis" :title="value">{{ value }}</span>
      </template>

      <template #status="{ value }">
        <span class="status-pill">{{ value }}</span>
      </template>

      <template #actions="{ row }">
        <button class="icon-btn" @click="viewProject(row)">
          <img src="@/assets/icon/search.png" alt="查看" />
        </button>
      </template>
    </SharedTable>
  </div>

  <SharedModal
      v-model="showModal"
      title="專案詳情"
      mode="project"
      @manage="onManage"
      @update:modelValue="handleClose"
      class="project-modal"
      titleAlign="center"
  >
    <div>專案名稱：{{ planInfo.planName }}</div>
    <div>專案狀態：{{ getStepName(planInfo.currentStep) }}</div>
    <div>創業者：{{ planInfo.userName }}</div>
    <div>總共創金額：{{ formatAmount(planInfo.participantAmount) }}</div>
    <hr />
    <div>共創者 {{ planInfo.participantData?.length || 0 }} 人</div>
    <div
        v-for="participant in planInfo.participantData"
        :key="participant.userId"
    >
      {{ participant.userName }}：{{ formatAmount(participant.amount) }}
      （狀態：{{ getParticipantStatus(participant.status) }}）
    </div>
  </SharedModal>

</template>
<script setup>
import {reactive, computed, ref, onMounted} from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {cityApi} from "@/api/modules/city.js";

import {stepApi} from "@/api/modules/step.js";
import {salesApi} from "@/api/modules/sales.js";
import {useAuth} from "@/composables/useAuth.js";
import { useRouter } from 'vue-router';

const router = useRouter();
const showModal = ref(false);

const selectedProject = ref({});
const { isLoggedIn, currentSales } = useAuth();

const columns = [
  { key: "date", label: "日期" },
  { key: "city", label: "專案區域" },
  { key: "name", label: "專案名稱" },
  { key: "userName", label: "創業者" },
  { key: "currentStep", label: "專案進度" },
  { key: "actions", label: "查看" },
];

const projectFilter = reactive({
  dateOrder: "",
  city: "",
  status: "",
});

const planSteps = ref([]);
async function getPlanSteps() {
  const response = await stepApi.getAllPlanStep();
  planSteps.value = response.data;
}

const cities = ref([]);
async function getCities() {
  const response = await cityApi.getCities();
  cities.value = response.data;
}

const plans = ref([]);
async function getAllPlanBySales() {
  const formData = {
    salesId: currentSales.value
  }
  const response = await salesApi.getAllPlanBySales(formData);
  plans.value = response.data;
}

// 獲取參與者狀態
const corePlanStep = ref([])
async function getCorePlanSteps() {
  const response = await stepApi.getAllCorePlanStep();
  corePlanStep.value = response.data;
}

onMounted(() => {
  Promise.all([getCities(), getPlanSteps(), getAllPlanBySales(),getCorePlanSteps()]);
});

// 將 API 數據映射到 projects 格式
const projects = computed(() => {
  return plans.value.map(plan => {
    // 找到對應的城市名稱
    const cityObj = cities.value.find(c => c.id === plan.city);
    const cityName = cityObj ? cityObj.name : '未知地區';

    // 找到對應的步驟名稱
    const stepObj = planSteps.value.find(s => s.id === plan.currentStep);
    const statusName = stepObj ? stepObj.step : '未知狀態';

    return {
      id: plan.id,
      date: plan.date,
      city: cityName,
      name: plan.planName,
      userName: plan.userName,
      creator: plan.userName,
      currentStep: statusName,
    };
  });
});

const displayedProjects = computed(() => {
  let list = [...projects.value];

  if (projectFilter.city) {
    list = list.filter((p) => p.city === projectFilter.city);
  }

  if (projectFilter.status) {
    // 直接比對 step 名稱
    console.log(projectFilter.status)
    list = list.filter((p) => p.currentStep === projectFilter.status);
  }

  if (projectFilter.dateOrder) {
    list.sort((a, b) =>
        projectFilter.dateOrder === "asc"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date)
    );
  }

  return list;
});

const planInfo = ref({});
const userSignContractInfo = ref({});
async function viewProject(row) {
  console.log(row)
  if (row.currentStep === '簽約資料業務審核中') {
    const formData = {
      salesId: currentSales.value,
      planId: row.id
    }
    const response = await salesApi.getUserSignContractBySales(formData);
    if (response.code === 0 ) {
      userSignContractInfo.value = response.data;
      // 開啟 url
      window.open(userSignContractInfo.value.signContractUrl, '_blank');
      return;
    } else {
      alert('獲取用戶簽署合約資訊失敗，無法查看詳情');
      return;
    }
  }
  selectedProject.value = row;
  const formData = {
    salesId: currentSales.value,
    planId: row.id
  }
  const response = await salesApi.getPlanInfoBySales(formData);
  planInfo.value = response.data;

  showModal.value = true;
}

// 格式化金額
function formatAmount(amount) {
  if (!amount) return '0';
  return amount.toLocaleString('zh-TW');
}

// 獲取步驟名稱
function getStepName(stepId) {
  const step = planSteps.value.find(s => s.id === stepId);
  return step ? step.step : '未知狀態';
}

function getParticipantStatus(stepId) {
  console.log(corePlanStep.value)
  const step = corePlanStep.value.find(s => s.id === stepId);
  return step ? step.step : '未知狀態';
}



function handleClose(val) {
  showModal.value = val;
}

function onManage() {
  router.push({
    name: 'member',
    query: {
      userId: planInfo.value.userId || selectedProject.value.userId,
      type: 1, // 傳遞 type
      planId: selectedProject.value.id, // 傳遞 planId
      autoOpen: 'true'
    }
  });
}
</script>

<style lang="scss" scoped>
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 14px;
  @media (max-width: 576px) {
    padding: 2px 0;
  }
}
.project-modal .modal-body div {
  font-size: 14px;
  line-height: 1.8;
}
</style>
