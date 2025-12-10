<template xmlns="http://www.w3.org/1999/html">
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
      <!-- planName 插槽 -->
      <template #planName="{ row }">
    <span class="plan-link" @click="openPlanDialog(row)">
      {{ row.planName }}
    </span>
      </template>

      <template #actions="{ row }">
        <button class="icon-btn" @click="viewMember(row)">
          <img src="@/assets/icon/search.png" alt="查看"/>
        </button>
      </template>
    </SharedTable>
  </div>
  <SharedModal
      v-model="showModal"
      :title="'會員詳細資訊'"
      :mode="'close'"
      @save="handleSave"
      @update:modelValue="handleClose"
      class="member-modal form"
      titleAlign="center"
  >
    <div class="modal-content-wrapper">
      <!-- 基本資料 -->
      <div class="modal-section">
        <div class="doc-label">基本資料</div>
        <div>姓名：{{ selectedMemberDetail.name }}</div>
        <div>手機號碼：{{ selectedMemberDetail.phone }}</div>
        <div>電子信箱：{{ selectedMemberDetail.email }}</div>
        <div>出生年月日：{{ selectedMemberDetail.birthday }}</div>
        <div>其他聯繫方式(Line)：{{ selectedMemberDetail.line }}</div>
        <div>會員身分：
          <span v-if="selectedMemberDetail.type?.includes(1)">創業者</span>
          <span v-if="selectedMemberDetail.type?.includes(1) && selectedMemberDetail.type?.includes(2)">、</span>
          <span v-if="selectedMemberDetail.type?.includes(2)">共創者</span>
        </div>
        <div>已參與專案數量：
          創業: {{ selectedMemberDetail.planCountInfo?.founderPlanCount || 0 }} 、
          共創: {{ selectedMemberDetail.planCountInfo?.coreFounderPlanCount || 0 }}
        </div>
      </div>

      <!-- 創業者資訊 - 只有當用戶是創業者時才顯示 -->
      <template v-if="selectedMemberDetail.type?.includes(1) && selectedMemberDetail.founderInfo">
        <hr/>
        <div class="modal-section">
          <div class="doc-label">創業者資訊</div>
          <div class="doc-label">
            預計加盟產業：{{ selectedMemberDetail.founderInfo.industryTypeName || '未設定' }}
          </div>
          <div>
            所在地區：{{ cities.find(city => city.id === selectedMemberDetail.founderInfo.city)?.name || '未設定' }}
          </div>
          <div>
            工作狀態：{{ selectedMemberDetail.founderInfo.workStatus }}
          </div>
          <div>
            最高學歷/專長背景：{{ selectedMemberDetail.founderInfo.education }}
          </div>
          <div>
            工作經驗描述：{{ selectedMemberDetail.founderInfo.workExperience || '未設定' }}
          </div>
          <div>
            自我介紹：{{ selectedMemberDetail.founderInfo.introduce || '未設定' }}
          </div>
          <div class="doc-label">
            創業預算：{{ formatAmount(selectedMemberDetail.founderInfo.budget) }} 元
          </div>
          <div>
            <span class="doc-label">上傳資訊：</span>
            <span
                class="doc-tag px-1"
                :class="{
                'clickable': selectedMemberDetail.founderInfo.fileInfo?.pcrUrl,
                'disabled': !selectedMemberDetail.founderInfo.fileInfo?.pcrUrl
              }"
                @click="openDocDialog('pcr', selectedMemberDetail.founderInfo.fileInfo.pcrUrl)"
            >
            良民證
          </span>
            <span
                class="doc-tag px-1"
                :class="{
                'clickable': selectedMemberDetail.founderInfo.fileInfo?.identifyUrl,
                'disabled': !selectedMemberDetail.founderInfo.fileInfo?.identifyUrl
              }"
                @click="selectedMemberDetail.founderInfo.fileInfo?.identifyUrl && openDocDialog('identify', selectedMemberDetail.founderInfo.fileInfo.identifyUrl)"
            >
              身分證明
            </span>
            <span
                class="doc-tag px-1"
                :class="{
                'clickable': selectedMemberDetail.founderInfo.fileInfo?.assetsUrl,
                'disabled': !selectedMemberDetail.founderInfo.fileInfo?.assetsUrl
              }"
                @click="openDocDialog('assets', selectedMemberDetail.founderInfo.fileInfo.assetsUrl)"
            >
            資產證明
          </span>
            <span
                class="doc-tag px-1"
                :class="{
                'clickable': selectedMemberDetail.founderInfo.companyInfo?.companyName,
                'disabled': !selectedMemberDetail.founderInfo.companyInfo?.companyName
              }"
                @click="openCompanyDialog(selectedMemberDetail.founderInfo.companyInfo)"
            >
            公司資料
          </span>
          </div>

          <SharedDropdown
              v-model="selectedMemberDetail.founderInfo.identifyStatus"
              label="身分驗證狀態"
              :options="[
               { label: '無須審核', value: 0 },
              { label: '業務初審', value: 1 },
              { label: '管理員審核', value: 2 },
              { label: '通過', value: 3 },
              { label: '不通過', value: 4 },
            ]"
              placeholder="身分檢核文件"
              class="form-group"
              readonly="true"
          />
        </div>
      </template>

      <!-- 共創者資訊 - 只有當用戶是共創者時才顯示 -->
      <template v-if="selectedMemberDetail.type?.includes(2) && selectedMemberDetail.coreFounderInfo">
        <hr/>
        <div class="modal-section">
          <div class="doc-label">共創者資訊</div>
          <div class="doc-label">
            預計參與產業：{{ selectedMemberDetail.coreFounderInfo.industryTypeName || '未設定' }}
          </div>
          <div class="doc-label">
            共創預算：{{ formatAmount(selectedMemberDetail.coreFounderInfo.budget) }} 元
          </div>
          <div>
            所在地區：{{ cities.find(city => city.id === selectedMemberDetail.coreFounderInfo.city)?.name || '未設定' }}
          </div>
          <div>
            工作狀態：{{ selectedMemberDetail.coreFounderInfo.workStatus || '未設定' }}
          </div>
          <div>
            最低可投入資產：{{ formatAmount(selectedMemberDetail.coreFounderInfo.minBudget) }} 元
          </div>
          <div>
            最高可投入資產：{{ formatAmount(selectedMemberDetail.coreFounderInfo.maxBudget) }} 元
          </div>
          <div>
            可接受投入參與年限：{{ selectedMemberDetail.coreFounderInfo.investLimitYearShow ? selectedMemberDetail.coreFounderInfo.investLimitYear + ' 年' : '不公開' }}
          </div>
          <div>
            理財經驗描述：{{ selectedMemberDetail.coreFounderInfo.experienceShow ? selectedMemberDetail.coreFounderInfo.experience : '不公開' }}
          </div>
          <div>
            自我介紹：{{ selectedMemberDetail.coreFounderInfo.introduceShow ? selectedMemberDetail.coreFounderInfo.introduce : '不公開' }}
          </div>
          <div>

          </div>
          <div>
            <span class="doc-label">上傳資訊：</span>
            <span
                v-if="selectedMemberDetail.coreFounderInfo.fileInfo?.identifyUrl"
                class="doc-tag clickable px-1"
                @click="openDocDialog('identify', selectedMemberDetail.coreFounderInfo.fileInfo.identifyUrl)"
            >
            身分證明
          </span>
            <span
                v-if="selectedMemberDetail.coreFounderInfo.fileInfo?.secondaryUrl"
                class="doc-tag clickable px-1"
                @click="openDocDialog('secondary', selectedMemberDetail.coreFounderInfo.fileInfo.secondaryUrl)"
            >
            第二證件
          </span>
          </div>

          <SharedDropdown
              v-model="selectedMemberDetail.coreFounderInfo.identifyStatus"
              label="身分驗證狀態"
              :options="[
              { label: '無須審核', value: 0 },
              { label: '業務初審', value: 1 },
              { label: '管理員審核', value: 2 },
              { label: '通過', value: 3 },
              { label: '不通過', value: 4 },
            ]"
              placeholder="身分檢核文件"
              class="form-group"
              readonly="true"
          />
        </div>
      </template>

      <!-- 參與專案明細 -->
      <hr/>
      <div class="modal-section mt-2">
        <div class="doc-label">參與專案明細</div>
        <div v-if="selectedMemberDetail.participantPlanInfo?.length > 0">
          <div
              v-for="plan in selectedMemberDetail.participantPlanInfo"
              :key="plan.id"
              class="doc-label mb-2"
          >
            {{ plan.planName }} |
            狀態: {{ plan.statusInfo }} |
            金額: {{ formatAmount(plan.amount) }} 元
            <span v-if="plan.remark" class="text-muted"> ({{ plan.remark }})</span>
          </div>
        </div>
        <div v-else class="text-muted">
          目前沒有參與任何專案
        </div>
      </div>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showPlanDialog"
      title="專案詳情"
      mode="project"
      @manage="handleManage"
      @update:modelValue="handleClosePlanDialog"
      class="project-modal"
      titleAlign="center"
  >
    <div class="modal-content-wrapper">
      <div class="modal-section">
        <div class="doc-label">專案名稱：{{ planDetail.planName || '未設定' }}</div>
        <div>專案狀態：{{ getPlanStatusText(planDetail.planStatus) }}</div>
        <div>創業者：{{ planDetail.userName || '未知' }}</div>
        <div>專案總預算：{{ formatAmount(planDetail.planStartupBudget) }} 元</div>
        <div>自備款：{{ formatAmount(planDetail.planSelfFunded) }} 元</div>
        <div>總募資金額：{{ formatAmount(planDetail.planAmount) }} 元</div>
        <div>共創者人數：{{ planDetail.planPartnerCount || 0 }} 人</div>
        <div class="color-1">尚缺募資金額：{{ formatAmount(planDetail.shortAmount) }} 元</div>
        <div class="color-1">尚缺募資人數：{{ planDetail.shortPartnerCount }} 人</div>

        <hr/>

        <div class="doc-label">共創者名單</div>
        <div v-if="planDetail.participantPlanInfo && planDetail.participantPlanInfo.length > 0">
          <div
              v-for="(participant, index) in planDetail.participantPlanInfo"
              :key="participant.id"
              class="doc-label mb-2"
          >

            {{ participant.name }} | {{ participant.sex }} | {{ participant.salesName }} | {{ participant.createdAt }}
            <br/>
            投入金額：{{ formatAmount(participant.amount) }} 元 -
            狀態：{{ getParticipantStatus(participant.status) }}
          </div>
        </div>
        <div v-else class="text-muted">
          目前沒有共創者
        </div>
      </div>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showDocDialog"
      :title="docDialogTitle"
      mode="close"
      @update:modelValue="handleCloseDocDialog"
      class="doc-modal"
      titleAlign="center"
  >
    <div class="modal-content-wrapper">
      <div class="modal-section text-center">
        <!-- 根據文件類型顯示不同內容 -->
        <iframe
            v-if="isCurrentDocPdf"
            :src="docDialogUrl"
            class="doc-pdf"
        ></iframe>
        <img
            v-else
            :src="docDialogUrl"
            alt="文件預覽"
            class="doc-image"
        />
      </div>
    </div>
  </SharedModal>

</template>
<script setup>
import {reactive, computed, ref, onMounted, watch} from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {useAuth} from "@/composables/useAuth.js";
import {salesApi} from "@/api/modules/sales.js";
import {stepApi} from "@/api/modules/step.js";
import {salesLevelApi} from "@/api/modules/salesLevel.js";
import {cityApi} from "@/api/modules/city.js";

const {isLoggedIn, currentSales} = useAuth();

import {useRoute, useRouter} from 'vue-router';
import {salesCheckApi} from "@/api/modules/salesCheck.js";
import {NewAlert} from "@/composables/useAlert.js";

const route = useRoute();
const router = useRouter();

const showModal = ref(false);
const selectedMember = ref({});

const columns = [
  {key: "formattedType", label: "身分"},
  {key: "createdAt", label: "時間"},
  {key: "name", label: "會員名字"},
  {key: "planName", label: "專案名稱"},
  {key: "actions", label: "查看"},
];

function formatMemberType(types) {
  if (!Array.isArray(types)) return '';
  const labels = [];
  if (types.includes(1)) labels.push('創業者');
  if (types.includes(2)) labels.push('共創者');
  return labels.join('、');
}

const members = reactive([]);

const filter = reactive({
  type: "",
  dateOrder: "",
  city: "",
  status: "",
});

const displayedMembers = computed(() => {
  console.log(filter)
  let list = [...members];

  if (filter.type) {
    list = list.filter((m) => Array.isArray(m.type) && m.type.includes(Number(filter.type)));
  }

  if (filter.status) {
    list = list.filter((m) => m.planStatus === filter.status);
  }

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
const corePlanStep = ref([]);

async function getAllPlanStep() {
  const response = await stepApi.getAllPlanStep();
  planSteps.value = response.data;
}

function getPlanStatusText(stepId) {
  const step = planSteps.value.find(s => s.id === stepId);
  return step ? step.step : '未知狀態';
}

async function getAllCorePlanStep() {
  const response = await stepApi.getAllCorePlanStep();
  corePlanStep.value = response.data;
}

function getParticipantStatus(stepId) {
  const step = corePlanStep.value.find(s => s.id === stepId);
  return step ? step.step : '未知狀態';
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
      formattedType: formatMemberType(member.type),
      planStatus: member.planStatus,
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


onMounted(async () => {
  if (isLoggedIn.value) {
    await getCities();
    await getAllPlanStep();
    await getAllCorePlanStep()
    await getSalesLevel();
    await getAllUserBySales();
  }
});

const showPlanDialog = ref(false);
const planDetail = ref({});

async function openPlanDialog(row) {
  const formData = {
    salesId: currentSales.value,
    userId: row.id,
    planId: row.planId || undefined,
    participantPlanId: row.participantPlanId || undefined,
  }

  const response = await salesApi.getUserPlanInfoBySales(formData)
  planDetail.value = response.data;
  showPlanDialog.value = true;
}

const handleManage = () => {
  const query = {
    userId: planDetail.value.userId,
    autoOpen: 'planDetail',
  }

  if (planDetail.value.participantPlanId && planDetail.value.participantPlanId > 0) {
    query.participantPlanId = planDetail.value.participantPlanId
  } else {
    query.planId = planDetail.value.planId
  }

  router.push({
    path: '/account-sales/management',
    query: query
  })

  showPlanDialog.value = false
}


const selectedMemberDetail = ref({});

async function viewMember(row) {
  selectedMember.value = {...row};
  showModal.value = true;
  await openMemberDetail(row.id);
}

async function openMemberDetail(userId) {
  const formData = {
    salesId: currentSales.value,
    userId: parseInt(userId),
  }

  try {
    const response = await salesApi.getUserInfoBySales(formData);
    console.log('用戶詳情:', response.data);

    if (response.code === 0) {
      selectedMemberDetail.value = response.data;
      showModal.value = true;
    } else {
      console.error('獲取用戶詳情失敗:', response.message);
    }
  } catch (error) {
    console.error('獲取用戶詳情失敗:', error);
  }
}

function handleClosePlanDialog(val) {
  showPlanDialog.value = val;
}

function handleCloseDocDialog(val) {
  showDocDialog.value = val;
}


function handleClose(val) {
  showModal.value = val;
}


const showDocDialog = ref(false)
const currentDocType = ref('')
const docDialogTitle = computed(() => {
  switch (currentDocType.value) {
    case 'pcr':
      return '良民證預覽'
    case 'identify':
      return '身分證明預覽'
    case 'assets':
      return '資產證明預覽'
    case 'secondary':
      return '第二證件預覽'
    default:
      return '文件預覽'
  }
})
const docDialogUrl = ref('')

// 🆕 判斷當前文件是否為 PDF
const isCurrentDocPdf = computed(() => {
  return docDialogUrl.value.toLowerCase().endsWith('.pdf')
})

// 🆕 修改後的打開文件對話框函數
const openDocDialog = (type, url) => {
  if (!url) return

  console.log(type, url)
  currentDocType.value = type
  docDialogUrl.value = url
  showDocDialog.value = true
}

</script>

<style scoped lang="scss">
.plan-link {
  color: #1e90ff;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #0066cc;
    text-decoration: underline;
  }
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

.doc-tag {
  font-size: 14px;
  cursor: default;
  transition: all 0.2s ease;

  &.clickable {
    color: #409eff;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #66b1ff;
      opacity: 0.8;
      transform: translateY(-1px);
    }
  }

  &.disabled {
    color: #9e9e9e;
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }
}

.dialog-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 1200px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item.total {
  grid-column: 1 / -1;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #e5e7eb;
  font-weight: 600;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.info-item span {
  font-size: 14px;
  color: #1f2937;
}


.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}


.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.detail-table th,
.detail-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.detail-table th {
  background: #f8f9fa;
  font-weight: 500;
  color: #666;
}

.detail-table tbody tr:hover {
  background: #f8f9fa;
}

.doc-modal {
  max-width: 95vw;
  max-height: 95vh;
}

// 🆕 圖片樣式
.doc-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

// 🆕 PDF iframe 樣式
.doc-pdf {
  width: 100%;
  height: 70vh;
  border: none;
  display: block;
}

.modal-content-wrapper {
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: #999;
    }
  }

  scrollbar-width: thin;
  scrollbar-color: #ccc #f5f5f5;
}

.modal-section {
  margin-bottom: 16px;

  .title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 12px;
    color: #333;
  }
}
</style>
