<template>
  <div class="fs-24">轄下會員列表</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="filter.type"
        placeholder="身分別"
        :options="[
          { label: '全部', value: '' },
          { label: '創業者', value: 1 },
          { label: '共創者', value: 2 },
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
          ...planSteps.map(step => ({ label: step.step, value: step.id }))
        ]"
      />
    </div>

    <SharedTable
      :columns="columns"
      :rows="displayedMembers"
      empty-text="目前沒有符合條件的會員"
    >
      <template #planStatus="{ row }">
        {{formatPlanStatus(row.planStatus, row.type)}}
      </template>
      <template #review="{ row }">
        <div v-if="getActionType(row) === 'review'" class="review-btn-group">
          <button class="btn-pass" @click="handleApproveClick(row, true)">通過</button>
          <button class="btn-fail" @click="handleApproveClick(row, false)">不通過</button>
        </div>

        <button
            v-else-if="getActionType(row) === 'notify'"
            class="btn-notify"
            @click="handleApprove(row, true)"
        >
          通知
        </button>

        <span v-else class="status-text">-</span>
      </template>
      <template #actions="{ row }">
        <button class="icon-btn" @click="viewMember(row)">
          <img src="@/assets/icon/search.png" alt="查看" />
        </button>
      </template>
    </SharedTable>
  </div>
  <SharedModal
      v-model="showModal"
      :title="selectedMember.type === 1 ? '共創者詳細資訊' : '會員詳細資訊'"
      :mode="selectedMember.type === 2 ? 'close' : 'member'"
      @save="handleSave"
      @update:modelValue="handleClose"
      class="member-modal form"
      titleAlign="center"
  >
    <!-- Type 1: 創業者 -->
    <template v-if="selectedMember.type === 1">
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
            v-model="selectedMemberDetail.reviewStatus"
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
    <template v-else-if="selectedMember.type === 2">
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

  <!-- 合約上傳 Dialog -->
  <SharedModal
      v-model="showContractDialog"
      title="上傳合約資料"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handleContractSubmit"
  >
    <div class="payment-form">
      <SharedUpload
          label="上傳合約*"
          accept=".pdf,.doc,.docx"
          :max-size="10"
          name="salesContractFile"
          v-model="contractForm.contractFileName"
          :error="contractErrors.contractFile"
          @upload-success="(result) => handleUploadSuccess('salesContractFile', result)"
          required
          :account="currentSales.value"  :id="currentSales.value"/>
    </div>
  </SharedModal>

  <!-- 不通過 Dialog -->
  <SharedModal
      v-model="showRemarkDialog"
      title="不通過原因"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handleRejectSubmit"
  >
    <div class="payment-form">
      <SharedInput
          id="remark"
          v-model="remark"
          label="不通過原因"
          placeholder="請輸入不通過的原因"
          type="textarea"
          class="form-group ml-3"
          :required="true"
      />
    </div>
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
import SharedUpload from "@/components/shared/Shared-Upload.vue";

const route = useRoute();

const showModal = ref(false);
const selectedMember = ref({});

const columns = [
  { key: "type", label: "身分" },
  { key: "planDate", label: "時間" },
  { key: "name", label: "會員名字" },
  { key: "planName", label: "專案名稱" },
  { key: "planStatus", label: "專案狀態" },
  { key: "review", label: "操作" },
  { key: "actions", label: "查看" },
];



const getActionType = (row) => {
  if (row.type === 1 && reviewStepsFounder.includes(row.planStatus)) {
    return 'review';
  }
  if (notifySteps.includes(row.planStatus)) {
    return 'notify';
  }
  return 'none';
}


// 格式化步驟狀態
const formatPlanStatus = (statusId, type) => {
  if (type === 1) {
    const step = planSteps.value.find(s => s.id === statusId);
    return step ? step.step : `未知狀態 (${statusId})`;
  } else if (type === 2) {
    const step = corePlanStep.value.find(s => s.id === statusId);
    return step ? step.step : `未知狀態 (${statusId})`;
  }
  return `未知狀態 (${statusId})`;
}

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

  const processedMembers = response.data.map(member => {
    const level = SalesLevels.value.find(level => level.id === member.rank);

    return {
      ...member,
      planStatus: member.planStatus,  // 保留原始 ID
      rank: level ? level.name : `未知等級 (${member.rank})`,
    };
  });

  members.splice(0, members.length, ...processedMembers);
  console.log(members)
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
const selectedMemberDetail = ref({});

// 自動打開會員詳情的函數
async function openMemberDetail(userId, typeFromQuery = null, planIdFromQuery = null) {
  // 優先從 query 參數獲取，否則從 members 中查找
  const member = members.find(m => m.id === parseInt(userId));
  console.log("test")
  const formData = {
    salesId: currentSales.value,
    userId: parseInt(userId),
    type: typeFromQuery || member.type,
    planId: planIdFromQuery || (member ? member.planId : 0)
  }
  console.log(formData)

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
          selectedMemberDetail.reviewStatus = false;
        } else if (currentStep === 1) {
          selectedMemberDetail.reviewStatus = "";
        } else if (currentStep > 2) {
          selectedMemberDetail.reviewStatus = true;
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


async function viewMember(row) {
  selectedMember.value = { ...row };
  showModal.value = true;
  await openMemberDetail(row.id, row.type, row.planId);
}

// 需要審核的步驟（創業者）
const reviewStepsFounder = [1, 4, 8, 14, 16, 18, 20];
// 需要通知的步驟
const notifySteps = [5];

const showRemarkDialog = ref(false);
const remark = ref('');
const currentProcessingRow = ref(null);

async function handleApproveClick(row, approved) {
  // 保存當前處理的 row
  currentProcessingRow.value = row;

  if (row.planStatus === 8 && approved) {
    showContractDialog.value = true;
    return; // 等待合約上傳完成
  }

  if (!approved) {
    showRemarkDialog.value = true;
    return; // 等待輸入不通過原因
  }

  // 如果是通過且不需要上傳合約，直接處理
  await handleApprove(row, true);
}

async function handleRejectSubmit() {
  if (!remark.value || remark.value.trim() === '') {
    alert('不通過原因不可為空');
    return;
  }

  // 使用保存的 currentProcessingRow 而不是 selectedMember
  await handleApprove(currentProcessingRow.value, false);

  showRemarkDialog.value = false;
  remark.value = '';
  currentProcessingRow.value = null; // 清空
}

async function handleContractSubmit() {
  if (!contractForm.contractFileName) {
    contractErrors.contractFile = '請上傳合約文件';
    return;
  }

  contractErrors.contractFile = '';

  // 在這裡處理合約提交邏輯
  alert('合約上傳成功');

  showContractDialog.value = false;

  // 清空合約表單
  contractForm.contractFileName = '';

  // 繼續進行審核
  await handleApprove(currentProcessingRow.value, true);
  currentProcessingRow.value = null; // 清空
}
async function handleApprove(row, approved) {
  console.log(row)
    const formData = {
      salesId: currentSales.value,
      planId: row.planId || 0,
      approved: approved,
      remark: remark.value || ''
    }
    let response;
    switch (row.planStatus) {
      case 1: // 創業計劃書審核
        response = await salesCheckApi.checkPlanBySales(formData)
          if (response.code === 0) {
            alert('已處理創業計劃書審核');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
        break;
      case 4: // 通知創業者進行下一步
        response = await salesCheckApi.paymentNotifyBySales(formData)
          if (response.code === 0) {
            alert('已處理創業者進行下一步');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
        break;
      case 8:
        formData.contractId = contractForm.contractFileId;
        response = await salesCheckApi.checkContractBySales(formData)
          if (response.code === 0) {
            alert('已處理合約審核');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
          break;
      case 14:
        response = await salesCheckApi.checkResourceBySales(formData)
          if (response.code === 0) {
            alert('已處理資源確認審核');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
        break;

      case 16:
        response = await salesCheckApi.checkFranchiseBySales(formData)
          if (response.code === 0) {
            alert('已處理加盟審核');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
        break;

      case 18:
        response = await salesCheckApi.checkAddressBySales(formData)
          if (response.code === 0) {
            alert('已處理營業地址審核');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
        break;

      case 20:
        response = await salesCheckApi.finishPlanBySales(formData)
          if (response.code === 0) {
            alert('已處理專案結案審核');
            await getAllUserBySales();
            showModal.value = false;
          } else {
            alert('操作失敗: ' + response.message);
          }
        break;

      default:
        alert('此步驟無法操作');
        return;
    }
}

const showContractDialog = ref(false);
const contractForm = reactive({
  contractFileId: null,
  contractFileName: '',
});

const contractErrors = reactive({
  contractFile: '',
});

function handleUploadSuccess(field, result) {
  console.log('Upload success result:', result); // 用來檢查返回的結果結構
  if (field === 'salesContractFile') {
    // 嘗試不同的可能屬性名稱
    contractForm.contractFileId = result.data?.id
    contractForm.contractFileName = result.data?.displayName
    contractErrors.contractFile = '';
  }
}

function handleClose(val) {
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

.review-btn-group {
  display: flex;
  gap: 8px;

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
.btn-notify {
  padding: 4px 10px;
  border-radius: 4px;
  background-color: #ff6634;
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
</style>
