<template>
  <div class="fs-24">轄下會員列表</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="filter.type"
        placeholder="身分別"
        :options="[
          { label: '全部', value: '' },
          { label: '創業者', value: '創業者' },
          { label: '共創者', value: '共創者' },
        ]"
      />

      <SharedDropdown
        v-model="filter.dateOrder"
        placeholder="依專案時間排序"
        :options="[
          { label: '新→舊', value: 'desc' },
          { label: '舊→新', value: 'asc' },
        ]"
      />

      <SharedDropdown
          v-model="filter.city"
          placeholder="依所在地區排序"
          :options="[
            { label: '全部', value: '' },
            ...cities.map(city => ({ label: city.name, value: city.id }))
          ]"
      />

      <SharedDropdown
        v-model="filter.status"
        placeholder="依專案狀態排序"
        :options="[
          { label: '全部', value: '' },
          ...planSteps.map(step => ({ label: step.step, value: step.step }))
        ]"
      />
    </div>

    <SharedTable
      :columns="columns"
      :rows="displayedMembers"
      empty-text="目前沒有符合條件的會員"
    >
      <template #actions="{ row }">
        <button class="icon-btn" @click="viewMember(row)">
          <img src="@/assets/icon/search.png" alt="查看" />
        </button>
      </template>
    </SharedTable>
  </div>
  <SharedModal
      v-model="showModal"
      :title="selectedMember.type === '共創者' ? '共創者詳細資訊' : '會員詳細資訊'"
      :mode="selectedMember.type === '共創者' ? 'close' : 'member'"
      @save="handleSave"
      @update:modelValue="handleClose"
      class="member-modal form"
      titleAlign="center"
  >
    <!-- Type 1: 創業者 -->
    <template v-if="selectedMember.type === '創業者'">
      <div class="modal-section">
        <div class="title">基本資料</div>
        <div>姓名：{{ selectedMember.name }}</div>
        <div>會員身分：{{ selectedMemberDetail.type }}</div>
        <div>已參與專案數量：創業: {{ selectedMemberDetail.founderPlanCount }} 、共創: {{ selectedMemberDetail.coreFounderPlanCount }}</div>
      </div>

      <div class="modal-section mt-3">
        <div class="title">創業者資訊</div>
        <div>姓名：{{ selectedMember.name }}</div>
        <div>專案名稱：{{ selectedMemberDetail.founderPlan?.[0]?.name }}</div>
        <div>
          創業者上傳資訊：
          <template v-for="(doc, i) in selectedMember.docs" :key="i">
          <span class="doc-tag">
            {{ doc }}<span v-if="i < selectedMember.docs.length - 1">、</span>
          </span>
          </template>
        </div>

        <SharedDropdown
            v-model="reviewStatus"
            label="創業計劃書"
            :options="[
          { label: '通過', value: true },
          { label: '不通過', value: false },
        ]"
            placeholder="審核狀態"
            class="form-group"
        />

        <SharedInput
            id="reviewRemark"
            v-if="reviewStatus === false"
            v-model="reviewRemark"
            label="不通過原因"
            placeholder="請輸入不通過的原因"
            type="textarea"
            class="form-group mt-3"
            :required="true"
        />

        <SharedDropdown
            v-model="selectedMemberDetail.identityCertificationStatus"
            label="身分驗證文件"
            :options="[
          { label: '通過', value: true },
          { label: '不通過', value: false },
        ]"
            placeholder="身分檢核文件"
            class="form-group"
            readonly="true"
        />
      </div>

      <div class="modal-section mt-4" v-if="selectedMemberDetail.coreFounderPlan?.length > 0">
        <div class="title">共創者資訊</div>
        <div>參與專案明細：</div>
        <div class="co-list">
          <div v-for="(c, i) in selectedMemberDetail.coreFounderPlan" :key="i" class="co-item">
            <div class="co-title">{{ c.name }}</div>
            <div class="co-status">{{ c.status }}</div>
            <div class="co-amount">{{ c.amount }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Type 2: 共創者 -->
    <template v-else-if="selectedMember.type === '共創者'">
      <div class="modal-section">
        <div class="title">共創專案資訊</div>
        <div>專案名稱：{{ selectedMemberDetail.planName }}</div>
        <div>專案狀態：{{ selectedMemberDetail.currentStepName }}</div>
        <div>創業者：{{ selectedMemberDetail.userName }}</div>
        <div>總共創金額：NT$ {{ formatAmount(selectedMemberDetail.participantAmount) }}</div>
      </div>

      <div class="modal-section mt-3">
        <div class="title">募資進度</div>
        <div>當前募資：NT$ {{ formatAmount(selectedMemberDetail.currentAmount) }}</div>
        <div>目標金額：NT$ {{ formatAmount(selectedMemberDetail.targetAmount) }}</div>
        <div>募資進度：{{ selectedMemberDetail.fundingProgress?.toFixed(2) }}%</div>
      </div>

      <div class="modal-section mt-3">
        <div class="title">參與資訊</div>
        <div>參與金額：NT$ {{ formatAmount(selectedMemberDetail.myAmount) }}</div>
        <div>參與狀態：{{ getParticipantStatus(selectedMemberDetail.myStatus) }}</div>
      </div>
    </template>
  </SharedModal>
</template>

<script setup>
import {reactive, computed, ref, onMounted,watch} from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {useAuth} from "@/composables/useAuth.js";
import {salesApi} from "@/api/modules/sales.js";
import {stepApi} from "@/api/modules/step.js";
import {salesLevelApi} from "@/api/modules/salesLevel.js";
import {salesCheckApi} from "@/api/modules/salesCheck.js";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {cityApi} from "@/api/modules/city.js";
const { isLoggedIn, currentSales } = useAuth();

import { useRoute } from 'vue-router';

const route = useRoute();

const showModal = ref(false);
const selectedMember = ref({});

const columns = [
  { key: "type", label: "身分" },
  { key: "planDate", label: "時間" },
  { key: "name", label: "會員名字" },
  { key: "planName", label: "專案名稱" },
  { key: "planStatus", label: "專案狀態"},
  { key: "actions", label: "查看" },
];

const members = reactive([
  {
    id: 1,
    type: "創業者",
    date: "2024-12-03",
    name: "張小白",
    planName: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    planStatus: "管理專案",
    planId: 101,
    identity: "創業者",
    projectName: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    status: "管理專案",
    projectCount: "創辦1、大創4",
    docs: ["創業計劃書", "合約", "公司資料", "公司帳戶"],
    reviewStatus: "",
    idDoc: "",
    coCreate: [
      {
        title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
        status: "媒合中",
        amount: "200,000",
      },
      {
        title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
        status: "媒合中",
        amount: "200,000",
      },
      {
        title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
        status: "媒合中",
        amount: "200,000",
      },
    ],
  },
]);

const filter = reactive({
  type: "",
  dateOrder: "",
  city: "",
  status: "",
});

const displayedMembers = computed(() => {
  console.log(filter)
  let list = [...members];
  if (filter.type)
    list = list.filter((m) => m.type === filter.type);

  if (filter.status)
    list = list.filter((m) => m.planStatus === filter.status);

  if (filter.dateOrder) {
    list.sort((a, b) =>
      filter.dateOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }

  if (filter.city) {
    list = list.filter((m) => m.city === filter.city);
  }
  return list;
});

const cities = ref([]);
async function getCities() {
  const response = await cityApi.getCities();
  cities.value = response.data;
}

const SalesLevels = ref([]);
async function getSalesLevel() {
  const response = await salesLevelApi.getSalesLevel();
  SalesLevels.value = response.data;
  console.log(SalesLevels.value);
}

const planSteps = ref([]);
async function getAllPlanStep() {
  const response = await stepApi.getAllPlanStep();
  planSteps.value = response.data;
}

const corePlanStep = ref([]);
async function getAllCorePlanStep() {
  const response = await stepApi.getAllCorePlanStep();
  corePlanStep.value = response.data;
}

async function getAllUserBySales() {
  const formData = {
    salesId: currentSales.value
  }

  const response = await salesApi.getAllUserBySales(formData);

  // 直接修改每個成員的 planStatus 為對應的文字
  const processedMembers = response.data.map(member => {
    // 根據 type 決定使用哪個 step
    let stepName;
    if (member.type === 1) {
      // 創業者：使用 planSteps
      const step = planSteps.value.find(step => step.id === member.planStatus);
      stepName = step ? step.step : `未知狀態 (${member.planStatus})`;
    } else if (member.type === 2) {
      // 共創者：使用 corePlanSteps
      const coreStep = corePlanStep.value.find(step => step.id === member.planStatus);
      stepName = coreStep ? coreStep.step : `未知狀態 (${member.planStatus})`;
    } else {
      stepName = `未知狀態 (${member.planStatus})`;
    }

    const level = SalesLevels.value.find(level => level.id === member.rank);
    const type = member.type === 1 ? '創業者' : member.type === 2 ? '共創者' : `未知身分 (${member.type})`;

    return {
      ...member,
      planStatus: stepName,
      rank: level ? level.name : `未知等級 (${member.rank})`,
      type: type
    };
  });

  members.splice(0, members.length, ...processedMembers);
}
function formatAmount(amount) {
  if (!amount) return '0';
  return amount.toLocaleString('zh-TW');
}

function getParticipantStatus(stepId) {
  console.log(corePlanStep.value)
  const step = corePlanStep.value.find(s => s.id === stepId);
  return step ? step.step : '未知狀態';
}


onMounted(async () => {
  if (isLoggedIn.value) {
    await getCities();
    await getAllPlanStep();
    await getAllCorePlanStep()
    await getAllCorePlanStep();
    await getSalesLevel();
    await getAllUserBySales();

    // 檢查是否有 autoOpen 參數
    if (route.query.autoOpen === 'true' && route.query.userId) {
      await openMemberDetail(
          route.query.userId,
          route.query.type ? parseInt(route.query.type) : null,
          route.query.planId ? parseInt(route.query.planId) : null
      );
    }
  }
});
const selectedMemberDetail = ref(null);

// 自動打開會員詳情的函數
async function openMemberDetail(userId, typeFromQuery = null, planIdFromQuery = null) {
  // 優先從 query 參數獲取，否則從 members 中查找
  const member = members.find(m => m.id === parseInt(userId));

  const formData = {
    salesId: currentSales.value,
    userId: parseInt(userId),
    type: typeFromQuery || (member ? getTypeId(member.type) : 1),
    planId: planIdFromQuery || (member ? member.planId : 0)
  }

  try {
    const response = await salesApi.getUserInfoBySales(formData);
    if (response.code === 0) {
      selectedMemberDetail.value = response.data;

      // 設置 selectedMember
      if (member) {
        selectedMember.value = { ...member };
      } else {
        // 從 query 重建基本資訊
        selectedMember.value = {
          id: parseInt(userId),
          name: response.data.userName || '未知用戶',
          type: formData.type === 1 ? '創業者' : '共創者',
          planId: formData.planId
        };
      }

      // 只在 type === 1 (創業者) 時處理審核狀態
      if (formData.type === 1 && selectedMemberDetail.value.founderPlan?.[0]) {
        const currentStep = selectedMemberDetail.value.founderPlan[0].currentStep;
        if (currentStep === 2) {
          reviewStatus.value = false;
        } else if (currentStep === 1) {
          reviewStatus.value = "";
        } else if (currentStep > 2) {
          reviewStatus.value = true;
        }
      }

      // 處理共創計劃狀態
      if (selectedMemberDetail.value.coreFounderPlan) {
        selectedMemberDetail.value.coreFounderPlan =
            selectedMemberDetail.value.coreFounderPlan.map(plan => {
              const step = corePlanStep.value.find(step => step.id === plan.status);
              return {
                ...plan,
                status: step ? step.step : `未知狀態 (${plan.status})`
              };
            });
      }

      // 處理創業計劃狀態
      if (selectedMemberDetail.value.founderPlan) {
        selectedMemberDetail.value.founderPlan =
            selectedMemberDetail.value.founderPlan.map(plan => {
              const step = planSteps.value.find(step => step.id === plan.status);
              return {
                ...plan,
                status: step ? step.userStep : `未知狀態 (${plan.status})`
              };
            });
      }

      showModal.value = true;
    }
  } catch (error) {
    console.error('獲取用戶詳情失敗:', error);
    alert('無法載入會員詳情');
  }
}

function getTypeId(type) {
  if (type === '創業者') return 1;
  if (type === '共創者') return 2;
  return null; // 或其他預設值
}

async function viewMember(row) {
  selectedMember.value = { ...row };

  const formData = {
    salesId: currentSales.value,
    userId: row.id,
    type:getTypeId(row.type),
    planId:row.planId
  }

  try {
    const response = await salesApi.getUserInfoBySales(formData);
    if (response.code === 0) {
      selectedMemberDetail.value = response.data;
      if (selectedMemberDetail.value.founderPlan[0].currentStep === 2) {
        reviewStatus.value = false;
      } else if (selectedMemberDetail.value.founderPlan[0].currentStep === 1) {
        reviewStatus.value = "";
      } else if (selectedMemberDetail.value.founderPlan[0].currentStep > 2) {
        reviewStatus.value = true;
      }

      // 處理所有共創計劃的狀態
      if (selectedMemberDetail.value.coreFounderPlan) {
        selectedMemberDetail.value.coreFounderPlan =
            selectedMemberDetail.value.coreFounderPlan.map(plan => {
              const step = corePlanStep.value.find(step => step.id === plan.status);
              return {
                ...plan,
                status: step ? step.step : `未知狀態 (${plan.status})`
              };
            });
      }

      // 處理創業計劃的狀態（如果有的話）
      if (selectedMemberDetail.value.founderPlan) {
        selectedMemberDetail.value.founderPlan =
            selectedMemberDetail.value.founderPlan.map(plan => {
              const step = planSteps.value.find(step => step.id === plan.status);
              return {
                ...plan,
                status: step ? step.step : `未知狀態 (${plan.status})`
              };
            });
      }
    }
  } catch (error) {
    console.error('獲取用戶詳情失敗:', error);
  }

  showModal.value = true;
}

function handleClose(val) {
  showModal.value = val;
}

const reviewStatus = ref("");
const reviewRemark = ref("");
async function handleSave(val) {
  console.log(reviewStatus.value);
  if (reviewStatus.value !== "") {
    const formData = {
      planId: selectedMemberDetail.value.founderPlan[0].id,
      salesId: currentSales.value,
      approved: reviewStatus.value,
      remark: reviewRemark.value
    }
    const response = await salesCheckApi.checkPlanBySales(formData)
    if (response.code !== 0) {
      alert(response.message);
    } else {
      alert("審核成功")
      await getAllUserBySales();
    }
  }
  showModal.value = val;

}
</script>
<style scoped lang="scss">
.doc-tag {
  color: $btn-orange;
}

.co-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.co-item {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 10px;
  align-items: center;

  .co-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .co-status {
    text-align: left;
  }
  .co-amount {
    text-align: left;
  }
}

.modal-section {
  gap: 5px;
  display: grid;
  .title {
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    color: $text-dark;
  }
}
</style>
