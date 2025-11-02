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
          :options="cityOptions"
      />

      <SharedDropdown
          v-model="projectFilter.status"
          placeholder="依專案進度排序"
          :options="statusOptions"
      />
    </div>

    <SharedTable
        :columns="columns"
        :rows="displayedProjects"
        empty-text="目前沒有符合條件的專案"
    >
      <!-- 專案區域 -->
      <template #city="{ row }">
        {{ getCityName(row.city) }}
      </template>

      <!-- 專案類型 -->
      <template #planType="{ row }">
        {{ row.planType === 1 ? '創業者' : '共創者' }}
      </template>

      <!-- 專案進度 -->
      <template #currentStep="{ row }">
        <span class="status-pill">{{ getStepName(row) }}</span>
      </template>

      <!-- 查看按鈕 -->
      <template #actions="{ row }">
        <button class="icon-btn" @click="viewProject(row)">
          <img src="@/assets/icon/search.png" alt="查看"/>
        </button>
      </template>
    </SharedTable>
  </div>

  <SharedModal
      v-model="showModal"
      title="專案詳情"
      size="lg"
      :mode="'close'"
      class="project-modal"
      @close="handleClose"
  >
      <div>
        <div>專案名稱：{{ planInfo.planName }}</div>
        <div>專案狀態：{{ getStepName(selectedProject) }}</div>
        <div>創業者姓名：{{ planInfo.userName }}</div>
        <div>專案總預算：{{ formatAmount(planInfo.planStartupBudget) }} 元</div>
        <div>自備款：{{ formatAmount(planInfo.planSelfFunded) }} 元</div>
        <div>總募款金額：{{ formatAmount(planInfo.planAmount) }} 元</div>
        <div>需求人數：{{ planInfo.planPartnerCount }} 人</div>
        <hr/>
        <div>
          <div class="fs-18 fw-600 mb-2">共創者列表</div>
          <div v-if="planInfo.participantPlanInfo && planInfo.participantPlanInfo.length > 0">
            <div
                v-for="participant in planInfo.participantPlanInfo"
                :key="participant.id"
                class="mb-2"
            >
              <div>姓名：{{ participant.name }} | 狀態：{{ getParticipantStatus(participant.status) }} | 投入金額：{{ formatAmount(participant.amount)}} 元</div>
            </div>
          </div>
          <div v-else>暫無共創者</div>
        </div>
      </div>
    <div class="review-btn-group">
        <button class="btn-pass" @click="handleApproveClick(selectedProject, true)">通過審核</button>
        <button class="btn-fail" @click="handleApproveClick(selectedProject, false)">不通過審核</button>
    </div>
  </SharedModal>

</template>

<script setup>
import {reactive, computed, ref, onMounted, nextTick} from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {cityApi} from "@/api/modules/city.js";
import {stepApi} from "@/api/modules/step.js";
import {salesApi} from "@/api/modules/sales.js";
import {useAuth} from "@/composables/useAuth.js";
import {useRoute, useRouter} from 'vue-router';
import {salesCheckApi} from "@/api/modules/salesCheck.js";
import SharedInput from "@/components/shared/Shared-Input.vue";

const router = useRouter();
const route = useRoute();
const showModal = ref(false);
const selectedProject = ref({});
const {isLoggedIn, currentSales} = useAuth();

const columns = [
  {key: "date", label: "日期"},
  {key: "city", label: "專案區域"},
  {key: "planType", label: "專案類型"},
  {key: "planName", label: "專案名稱"},
  {key: "userName", label: "創業者"},
  {key: "currentStep", label: "專案進度"},
  {key: "actions", label: "查看"},
];

const projectFilter = reactive({
  dateOrder: "",
  city: "",
  status: "",
});

// 基礎資料
const planSteps = ref([]);
const corePlanStep = ref([]);
const cities = ref([]);
const plans = ref([]);
const planInfo = ref({});

// 獲取城市列表
async function getCities() {
  const response = await cityApi.getCities();
  cities.value = response.data;
}

// 獲取創業者步驟列表
async function getPlanSteps() {
  const response = await stepApi.getAllPlanStep();
  planSteps.value = response.data;
}

// 獲取共創者步驟列表
async function getCorePlanSteps() {
  const response = await stepApi.getAllCorePlanStep();
  corePlanStep.value = response.data;
}

// 獲取所有專案（直接使用 API 返回的資料）
async function getAllPlanBySales() {
  const formData = {
    salesId: currentSales.value
  }
  const response = await salesApi.getAllPlanBySales(formData);
  plans.value = response.data;
}

// 獲取城市名稱
const getCityName = (cityId) => {
  const city = cities.value.find(c => c.id === cityId);
  return city ? city.name : '未知地區';
}

// 獲取步驟名稱（根據 planType 決定使用哪個步驟列表）
const getStepName = (row) => {
  if (row.planType === 1) {
    // 創業者：使用 currentStep
    const step = planSteps.value.find(s => s.id === row.currentStep);
    return step ? step.step : '未知狀態';
  } else {
    // 共創者：使用 currentCoreStep
    const step = corePlanStep.value.find(s => s.id === row.currentCoreStep);
    return step ? step.step : '未知狀態';
  }
}

// 城市篩選選項
const cityOptions = computed(() => {
  return [
    {label: '全部', value: ''},
    ...cities.value.map(city => ({label: city.name, value: city.id}))
  ];
});

// 狀態篩選選項（合併創業者和共創者的步驟）
const statusOptions = computed(() => {
  const options = [{label: '全部', value: ''}];

  // 添加創業者步驟
  planSteps.value.forEach(step => {
    options.push({
      label: `${step.step} (創業)`,
      value: `founder-${step.id}`
    });
  });

  // 添加共創者步驟
  corePlanStep.value.forEach(step => {
    options.push({
      label: `${step.step} (共創)`,
      value: `core-${step.id}`
    });
  });

  return options;
});

// 篩選和排序後的專案列表
const displayedProjects = computed(() => {
  let list = [...plans.value];

  // 城市篩選
  if (projectFilter.city) {
    list = list.filter(p => p.city === projectFilter.city);
  }

  // 狀態篩選
  if (projectFilter.status) {
    const [type, stepId] = projectFilter.status.split('-');
    const id = parseInt(stepId);

    list = list.filter(p => {
      if (type === 'founder' && p.planType === 1) {
        return p.currentStep === id;
      } else if (type === 'core' && p.planType === 2) {
        return p.currentCoreStep === id;
      }
      return false;
    });
  }

  // 日期排序
  if (projectFilter.dateOrder === 'desc') {
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (projectFilter.dateOrder === 'asc') {
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return list;
});

// 查看專案詳情
async function viewProject(row) {
  selectedProject.value = row;
  // 一般專案詳情
  const formData = {
    salesId: currentSales.value,
    userId: row.userId,
  }

  // 根據 planType 決定傳遞哪個 ID
  if (row.planType === 1) {
    formData.planId = row.planId;
  } else {
    formData.participantPlanId = row.participantPlanId;
  }

  try {
    const response = await salesApi.getUserPlanInfoBySales(formData);
    if (response.code === 0) {
      planInfo.value = response.data;
      showModal.value = true;
    }
  } catch (error) {
    console.error('獲取專案詳情失敗:', error);
  }
}

// 格式化金額
function formatAmount(amount) {
  if (!amount && amount !== 0) return '0';
  return amount.toLocaleString('zh-TW');
}

// 獲取共創者狀態文字（用於 Modal 中的參與者列表）
function getParticipantStatus(stepId) {
  const step = corePlanStep.value.find(s => s.id === stepId);
  return step ? step.step : '未知狀態';
}

// 關閉 Modal
function handleClose(val) {
  showModal.value = val;
}


// 審核相關
const showAddressDialog = ref(false);
const showRemarkDialog = ref(false);
const remark = ref('');
const currentProcessingRow = ref(null);

async function handleApproveClick(row, approved) {
  currentProcessingRow.value = row;

  if (row.currentStep === 6 && approved) {
    showContractDialog.value = true;
    return;
  }

  if (row.currentStep === 18 && approved) {
    showAddressDialog.value = true;
    return;
  }

  if (!approved) {
    showRemarkDialog.value = true;
    return;
  }

  await handleApprove(row, true);
}

// 組件掛載
onMounted(async () => {
  try {
    await Promise.all([
      getCities(),
      getPlanSteps(),
      getCorePlanSteps(),
      getAllPlanBySales(),
    ]);

    // 檢查 URL 參數並自動打開
    const {autoOpen, userId, planId, participantPlanId} = route.query;

    if (autoOpen === 'planDetail' && userId) {
      await nextTick();
      await autoOpenPlanDialog(userId, planId, participantPlanId);
    }
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});

// 自動打開專案詳情 Dialog
async function autoOpenPlanDialog(userId, planId, participantPlanId) {
  const formData = {
    salesId: currentSales.value,
    userId: parseInt(userId),
  }

  // 根據參數決定傳遞哪個 ID
  if (planId) {
    formData.planId = parseInt(planId);
  }
  if (participantPlanId) {
    formData.participantPlanId = parseInt(participantPlanId);
  }

  try {
    const response = await salesApi.getUserPlanInfoBySales(formData);

    if (response.code === 0) {
      planInfo.value = response.data;
      showModal.value = true;

    } else {
      console.error('獲取專案詳情失敗:', response.message);
    }
  } catch (error) {
    console.error('自動打開專案詳情失敗:', error);
  }
}
</script>

<style lang="scss" scoped>
.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  background: #f0f0f0;

  @media (max-width: 576px) {
    padding: 2px 8px;
  }
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    opacity: 0.7;
  }
}

.project-modal .modal-body div {
  font-size: 14px;
  line-height: 1.8;
}

.review-btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;

  button {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &.btn-pass {
      background: #ff6634;
      color: #ffffff;
    }

    &.btn-fail {
      background: #ffcc66;
      color: #373a36;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
