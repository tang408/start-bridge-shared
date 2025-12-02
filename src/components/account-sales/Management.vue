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
      <div>專案狀態：{{ formatPlanInfoStatus() }}</div>
      <div>創業者姓名：{{ planInfo.userName }}</div>
      <div>專案總預算：{{ formatAmount(planInfo.planStartupBudget) }} 元</div>
      <div>自備款：{{ formatAmount(planInfo.planSelfFunded) }} 元</div>
      <div>總募款金額：{{ formatAmount(planInfo.planAmount) }} 元</div>
      <div>需求人數：{{ planInfo.planPartnerCount }} 人</div>
      <div v-if="planInfo.paymentStatus || planInfo.contractStatus">
        證明上傳狀態：
        <span :class="getStatusClass('payment', planInfo.paymentStatus)">{{ getStatusText('payment', planInfo.paymentStatus) }}</span>
        <span :class="getStatusClass('contract', planInfo.contractStatus)">{{ getStatusText('contract', planInfo.contractStatus) }}</span>
      </div>
      <div>
        <span class="doc-label">上傳資訊：</span>
        <span
            class="doc-tag clickable px-1"
            @click="openPlanDetailDialog(planInfo)"
        >
            創業計劃書
          </span>
        <span
            class="doc-tag px-1"
            :class="{
            'clickable': planContractInfo?.finalContractUrl,
            'disabled': !planContractInfo?.finalContractUrl
            }"
            @click="planContractInfo?.finalContractUrl && openPlanContractDialog(planInfo)"
        >
        合約
        </span>
        <span
            class="doc-tag clickable px-1"
            v-if="planInfo?.founderPcrc"
            @click="openCertificationDialog('pcr',planInfo.founderPcrc)"
        >
        良民證
        </span>
        <span
            class="doc-tag clickable px-1"
            v-if="planInfo?.founderIdc"
            @click="openCertificationDialog('identify',planInfo.founderIdc)"
        >
        身分證明
        </span>
        <span
            class="doc-tag clickable px-1"
            v-if="planInfo?.founderAssetsc"
            @click="openCertificationDialog('assets',planInfo.founderAssetsc)"
        >
        財產證明
        </span>
        <span
            class="doc-tag clickable px-1"
            v-if="planInfo?.coreFounderIdc"
            @click="openCertificationDialog('income',planInfo.coreFounderIdc)"
        >
        身分證明
        </span>
        <span
            class="doc-tag clickable px-1"
            v-if="planInfo?.coreFounderSecondIdc"
            @click="openCertificationDialog('income',planInfo.coreFounderSecondIdc)"
        >
        第二身分證明
        </span>
      </div>
      <hr/>
      <div>
        <div class="fs-18 fw-600 mb-2">共創者列表</div>
        <div v-if="planInfo.participantPlanInfo && planInfo.participantPlanInfo.length > 0">
          <div
              v-for="participant in planInfo.participantPlanInfo"
              :key="participant.id"
              class="participant-item mb-2"
              :class="{ 'highlight-participant': isParticipantHighlighted(participant.id) }"
          >
            <div>
              姓名：{{ participant.name }} |
              狀態：{{ getParticipantStatus(participant.status) }} |
              投入金額：{{ formatAmount(participant.amount) }} 元
            </div>
          </div>
        </div>
        <div v-else>暫無共創者</div>
      </div>
    </div>

    <!-- ⭐ 只在特定狀態時顯示審核按鈕 -->
    <div v-if="shouldShowReviewButtons()" class="review-btn-group">
      <button class="btn-pass" @click="handleApproveClick(selectedProject, true)">通過</button>
      <button class="btn-fail" @click="handleApproveClick(selectedProject, false)">不通過</button>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showRemarkDialog"
      title="填寫不通過原因"
      size="md"
      :mode="'submit'"
      @close="remark = ''"
      @submit="handleApprove(currentProcessingRow, false)"
  >
    <SharedInput
        v-model="remark"
        type="text"
        placeholder="請輸入不通過的原因..."
        id="remark-input"/>
  </SharedModal>

  <!-- 文件詳情 Dialog -->
  <SharedModal
      v-model="showDocDialog"
      :title="docDialogTitle"
      mode="close"
      class="doc-modal form"
      @update:modelValue="handleCloseDocDialog"
      titleAlign="center"
  >

    <div v-if="showDocDialog" class="dialog-overlay" @click="showDocDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="modal-content-wrapper">
          <div class="dialog-body">
            <!-- 創業計劃書 -->
            <div v-if="planDetail">
              <div class="info-section">
                <h4>基本資訊</h4>
                <div class="info-grid">
                  <div class="info-item" v-if="planDetail.planDetail.hasExperience">
                    <label>是否有相關經驗：</label>
                    <span>{{ planDetail.planDetail.hasExperience ? '是' : '否' }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.experienceDetails">
                    <label>經驗詳情：</label>
                    <span>{{ planDetail.planDetail.experienceDetails }}</span>
                  </div>
                  <div class="info-item">
                    <label>財務限制：</label>
                    <span>{{ planDetail.planDetail.financialConstraints ? '是' : '否' }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.constraintsExplanation">
                    <label>限制說明：</label>
                    <span>{{ planDetail.planDetail.constraintsExplanation }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail?.expectedOpeningInfo">
                    <label>預計開業區域/坪數/店面狀況：</label>
                    <span>{{ planDetail?.expectedOpeningInfo }}</span>
                    </div>
                  <div class="info-item" v-if="planDetail?.expectedOpeningDate">
                    <label>預計開業時間：</label>
                    <span>{{ planDetail?.expectedOpeningDate }}</span>
                  </div>
                </div>
              </div>
              <hr/>
              <div class="info-section">
                <h4>優勢與資源</h4>
                <div class="info-grid">
                  <div class="info-item" v-if="planDetail.planDetail.advantageExplanation">
                    <label>優勢說明：</label>
                    <span>{{ planDetail.planDetail.advantageExplanation }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.availableResources">
                    <label>可用資源：</label>
                    <span>{{ planDetail.planDetail.availableResources }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.supportDocumentation">
                    <label>支持文件：</label>
                    <span>{{ planDetail.planDetail.supportDocumentation }}</span>
                  </div>
                </div>
              </div>
              <hr/>
              <div class="info-section">
                <h4>創新與計劃</h4>
                <div class="info-grid">
                  <div class="info-item" v-if="planDetail.planDetail.innovationDescription">
                    <label>創新描述：</label>
                    <span>{{ planDetail.planDetail.innovationDescription }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.briefingSession">
                    <label>創業規劃是否有參加其他說明會：</label>
                    <span>{{ planDetail.planDetail.briefingSession }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.nextStagePlan">
                    <label>下階段計劃：</label>
                    <span>{{ planDetail.planDetail.nextStagePlan }}</span>
                  </div>
                </div>
              </div>
              <hr/>
              <div class="info-section">
                <h4>招募資訊</h4>
                <div class="info-grid">
                  <div class="info-item" v-if="planDetail.planDetail.recruitmentMethods">
                    <label>招募方式：</label>
                    <span>{{ planDetail.planDetail.recruitmentMethods }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.expectedNumberPeople">
                    <label>預期人數：</label>
                    <span>{{ planDetail.planDetail.expectedNumberPeople }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.recruitmentPipeline">
                    <label>招募管道：</label>
                    <span>{{ planDetail.planDetail.recruitmentPipeline }}</span>
                  </div>
                </div>
              </div>
              <hr/>
              <div class="info-section">
                <h4>其他資訊</h4>
                <div class="info-grid">
                  <div class="info-item" v-if="planDetail.planDetail.investTime">
                    <label>投入時間：</label>
                    <span>{{ planDetail.planDetail.investTime }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.customerSource">
                    <label>客源來源：</label>
                    <span>{{ planDetail.planDetail.customerSource }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.storeLocationType">
                    <label>店面類型：</label>
                    <span>{{ planDetail.planDetail.storeLocationType }}</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planDetail.coFounderAddedValue">
                    <label>共創者附加價值：</label>
                    <span>{{ planDetail.planDetail.coFounderAddedValue }}</span>
                  </div>
                </div>
              </div>
              <hr/>
              <!-- 籌備成本 -->
              <div class="info-section">
                <h4>籌備成本明細</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <label>品牌加盟的相關費用 ：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.franchiseFee?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>店面的裝潢設計工程 ：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.decorationCosts?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>店面租賃兩壓一租：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.storeRentCosts?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>營運設備、生財器具：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.equipmentCosts?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>開店前首批儲備物料：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.firstMaterialCost?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>創業者預計支薪預算：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.paySalaryBudget?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>籌備期其他人事成本：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.otherPersonnelCosts?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>開店前品牌行銷費用：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.marketingExpenses?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>營運週轉金及現金流：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.cashFlow?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>{{planDetail.planPrepareCosts?.otherCostsTitle }}：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.otherCosts?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item total">
                    <label>總計：</label>
                    <span>NT$ {{ prepareConstsTotal.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
              <hr/>
              <!-- 營運成本 -->
              <div class="info-section">
                <h4>營運成本百分比</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <label>營業額目標：</label>
                    <span>NT$ {{ planDetail.planOperatingCost.turnoverTarget?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>物料成本：</label>
                    <span>{{
                        planDetail.planOperatingCost.firstMaterialCostsPercent
                      }}% (NT$ {{ planDetail.planOperatingCost.firstMaterialCostsAmount?.toLocaleString() }})</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planOperatingCost.firstMaterialCostsRemark">
                    <label>備註：</label>
                    <span>{{ planDetail.planOperatingCost.firstMaterialCostsRemark }}</span>
                  </div>
                  <div class="info-item">
                    <label>人事成本：</label>
                    <span>{{
                        planDetail.planOperatingCost.personnelCostsPercent
                      }}% (NT$ {{ planDetail.planOperatingCost.personnelCostsAmount?.toLocaleString() }})</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planOperatingCost.personnelCostsRemark">
                    <label>備註：</label>
                    <span>{{ planDetail.planOperatingCost.personnelCostsRemark }}</span>
                  </div>
                  <div class="info-item">
                    <label>租金成本：</label>
                    <span>{{
                        planDetail.planOperatingCost.rentalCostsPercent
                      }}% (NT$ {{ planDetail.planOperatingCost.rentalCostsAmount?.toLocaleString() }})</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planOperatingCost.rentalCostsRemark">
                    <label>備註：</label>
                    <span>{{ planDetail.planOperatingCost.rentalCostsRemark }}</span>
                  </div>
                  <div class="info-item">
                    <label>營運成本：</label>
                    <span>{{
                        planDetail.planOperatingCost.peratingCostsPercent
                      }}% (NT$ {{ planDetail.planOperatingCost.peratingCostsAmount?.toLocaleString() }})</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planOperatingCost.peratingCostsRemark">
                    <label>備註：</label>
                    <span>{{ planDetail.planOperatingCost.peratingCostsRemark }}</span>
                  </div>
                  <div class="info-item">
                    <label>淨利：</label>
                    <span>{{
                        planDetail.planOperatingCost.otherCostsPercent
                      }}% (NT$ {{ planDetail.planOperatingCost.otherCostsAmount?.toLocaleString() }})</span>
                  </div>
                  <div class="info-item" v-if="planDetail.planOperatingCost.otherCostsRemark">
                    <label>備註：</label>
                    <span>{{ planDetail.planOperatingCost.otherCostsRemark }}</span>
                  </div>

                  <br/>
                  <div class="info-item">
                    <label>獎勵門檻：</label>
                    <span>NT$ {{ planDetail.planOperatingCost.rewardThreshold?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>獎勵百分比：</label>
                    <span>{{ planDetail.planOperatingCost.rewardPercent }}%</span>
                  </div>
                  <div class="info-item full-width" v-if="planDetail.planOperatingCost.otherStatement">
                    <label>其他說明：</label>
                    <span>{{ planDetail.planOperatingCost.otherStatement }}</span>
                  </div>
                </div>
              </div>
              <hr/>

              <!-- 分潤條款 -->
              <div class="info-section">
                <h4>分潤條款</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <label>分潤週期：</label>
                    <span>{{ planDetail.planProfitSharing.profitDistributionCycle }}</span>
                  </div>
                  <div class="info-item">
                    <label>計算方式：</label>
                    <span>{{ planDetail.planProfitSharing.profitCalculationMethod }}</span>
                  </div>
                  <div class="info-item">
                    <label>支付方式：</label>
                    <span>{{ planDetail.planProfitSharing.profitPaymentMethod }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showAddressDialog"
      title="查看地址"
      mode="submit"
      confirmText="確認"
      cancelText="取消"
      :showCancel="true"
      @submit="handleAddressSubmit"
      @cancel="handleAddressCancel"
  >
    <div class="address-form">
      <SharedInput
          id="address"
          v-model="addressForm.address"
          label="地址*"
          placeholder="請輸入完整地址"
          type="text"
          class="form-group"
          :error="addressErrors.address"
          :required="true"
      />
    </div>
  </SharedModal>

  <SharedModal
      v-model="showCertificationDialog"
      :title="certificationDialogTitle"
      mode="close"
      @update:modelValue="handleCloseDocDialog"
      class="doc-modal"
      titleAlign="center"
      :large="true"
  >
    <div class="modal-content-wrapper">
      <div class="modal-section text-center">
        <img :src="docDialogUrl" alt="文件預覽" class="doc-image"/>
      </div>
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
import {NewAlert} from "@/composables/useAlert.js";

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

// 添加高亮狀態
const highlightParticipantId = ref(null);

// 修改 viewProject 函數
async function viewProject(row) {
  selectedProject.value = row;

  // 如果是共創者（planType === 2），記錄當前的 participantPlanId 用於高亮
  if (row.planType === 2 && row.participantPlanId) {
    highlightParticipantId.value = row.participantPlanId;
  } else {
    highlightParticipantId.value = null;
  }

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

  const contractFormData = {
    salesId: currentSales.value,
    planId: row.planId,
    userId: row.userId,
  }

  const contractRes = await salesApi.getPlanFinalContractBySales(contractFormData);
  if (contractRes.code === 0) {
    planContractInfo.value = contractRes.data;
  } else {
    planContractInfo.value = {};
  }
}


// 檢查是否需要高亮
function isParticipantHighlighted(participantId) {
  return highlightParticipantId.value === participantId;
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

// 審核相關
const showRemarkDialog = ref(false);
const remark = ref('');
const currentProcessingRow = ref(null);

// 格式化 planInfo 的狀態
const formatPlanInfoStatus = () => {
  if (!planInfo.value.planStatus) return '未知狀態';

  // 根據是否有 participantPlanId 決定查詢哪個步驟列表
  if (planInfo.value.participantPlanId && planInfo.value.participantPlanId > 0) {
    // 共創者
    const step = corePlanStep.value.find(s => s.id === planInfo.value.planStatus);
    return step ? step.step : '未知狀態';
  } else {
    // 創業者
    const step = planSteps.value.find(s => s.id === planInfo.value.planStatus);
    return step ? step.step : '未知狀態';
  }
}

// 判斷是否應該顯示審核按鈕
const shouldShowReviewButtons = () => {
  if (!planInfo.value) return false;

  // 判斷是創業者還是共創者
  const isParticipant = !!planInfo.value.participantPlanId; // 有 participantPlanId 表示是共創者

  if (isParticipant) {
    // 共創者：根據 participantPlanStep 判斷
    if (!planInfo.value.participantPlanStep) return false;

    // 共創者可審核的步驟
    const participantReviewableSteps = [1, 10, 15]; // 根據實際業務調整
    return participantReviewableSteps.includes(planInfo.value.participantPlanStep);
  } else {
    // 創業者：根據 planStatus 判斷
    if (!planInfo.value.planStatus) return false;

    // 創業者可審核的步驟
    const founderReviewableSteps = [1, 13, 15, 17, 19]; // 可以審核的步驟
    return founderReviewableSteps.includes(planInfo.value.planStatus);
  }
}

// 修改 handleApproveClick，使用 planInfo 而不是 selectedProject
async function handleApproveClick(row, approved) {
  // 使用 planInfo 構建審核資料
  const reviewData = {
    planId: planInfo.value.planId,
    participantPlanId: planInfo.value.participantPlanId,
    planType: planInfo.value.participantPlanId ? 2 : 1,
    userId: planInfo.value.userId,
    currentStep: planInfo.value.planStatus,
    participantPlanStep: planInfo.value.participantPlanStep,
  };

  currentProcessingRow.value = reviewData;

  if (!approved) {
    showRemarkDialog.value = true;
    return;
  }

  await handleApprove(reviewData, true);
}

// 修改 handleApprove
async function handleApprove(data, approved) {
  console.log(data)
  console.log('click1')
  const formData = {
    salesId: currentSales.value,
    approved: approved,
    userId: data.userId,
  };

  // 根據 planType 決定傳遞哪個 ID
  if (data.planType === 1) {
    formData.planId = data.planId;
  } else {
    formData.participantPlanId = data.participantPlanId;
  }

  if (!approved) {
    formData.remark = remark.value;
  }

  // 根據當前步驟調用對應的 API
  if (data.planType === 1 && data.currentStep === 1) {
    const res = await salesCheckApi.checkPlanBySales(formData);
    if (res.code === 0) {
      const identityFormData = {
        salesId: currentSales.value,
        userId: data.userId,
        type: 'founder',
        approved: approved,
        remark: remark.value || '',
      }
      await salesCheckApi.checkUserIdentityBySales(identityFormData)
      await NewAlert.show("成功！", "審核成功");
      showModal.value = false;
      if (!approved) {
        const identityFormData = {
          salesId: currentSales.value,
          userId: data.userId,
          type: 'founder',
          approved: approved,
          remark: remark.value || '',
        }
        await salesCheckApi.checkUserIdentityBySales(identityFormData)
        showRemarkDialog.value = false;
      }
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗！", "審核失敗：" + res.message);
    }
  }
  if (data.planType === 1 && data.currentStep === 13) {
    const res = await salesCheckApi.checkResourceBySales(formData);
    if (res.code === 0) {
      await NewAlert.show("成功！", "審核成功");
      showModal.value = false;
      if (!approved) {
        showRemarkDialog.value = false;
      }
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗！", "審核失敗：" + res.message);
    }
  }
  if (data.planType === 1 && data.currentStep === 15) {
    const res = await salesCheckApi.checkFranchiseBySales(formData);
    if (res.code === 0) {
      await NewAlert.show("成功！", "審核成功");
      showModal.value = false;
      if (!approved) {
        showRemarkDialog.value = false;
      }
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗！", "審核失敗：" + res.message);
    }
  }
  if (data.planType === 1 && data.currentStep === 17) {
    showAddressDialog.value = true;
    openAddressDialog();
  }
  if (data.planType === 1 && data.currentStep === 19) {
    const res = await salesCheckApi.finishPlanBySales(formData);
    if (res.code === 0) {
      await NewAlert.show("成功！", "審核成功");
      showModal.value = false;
      if (!approved) {
        showRemarkDialog.value = false;
      }
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗！", "審核失敗：" + res.message);
    }
  }


  if (data.planType === 2 && data.participantPlanStep === 1) {
    const res = await salesCheckApi.checkCoreMoneyBySales(formData);
    if (res.code === 0) {
      const identityFormData = {
        salesId: currentSales.value,
        userId: data.userId,
        type: 'coreFounder',
        approved: approved,
        remark: remark.value || '',
      }
      await salesCheckApi.checkUserIdentityBySales(identityFormData)
      await NewAlert.show("成功！", "審核成功");
      showModal.value = false;
      if (!approved) {
        const identityFormData = {
          salesId: currentSales.value,
          userId: data.userId,
          type: 'coreFounder',
          approved: approved,
          remark: remark.value || '',
        }
        await salesCheckApi.checkUserIdentityBySales(identityFormData)
        showRemarkDialog.value = false;
      }
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗！", "審核失敗：" + res.message);
    }
  }

  if (data.planType === 2 && data.participantPlanStep === 10) {
    const res = await salesCheckApi.contactUserBySales(formData);
    if (res.code === 0) {
      await NewAlert.show("成功！", "審核成功");
      showModal.value = false;
      if (!approved) {
        showRemarkDialog.value = false;
      }
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗！", "審核失敗：" + res.message);
    }
  }
}

const showCertificationDialog = ref(false);
const docDialogUrl = ref('');
const currentDocType = ref('')

const certificationDialogTitle = computed(() => {
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

const openCertificationDialog = (type,url) => {
  console.log(type,url)
  showCertificationDialog.value = true
  docDialogUrl.value = url

}



// 關閉 Modal 時清空高亮
function handleClose() {
  showModal.value = false;
  selectedProject.value = {};
  planInfo.value = {};
  highlightParticipantId.value = null; // 清空高亮
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

// 文件詳情 Dialog 相關
const showDocDialog = ref(false);
const docDialogTitle = ref('');
const planDetail = ref({});

async function openPlanDetailDialog(plan) {
  docDialogTitle.value = '創業計劃書';
  showDocDialog.value = true;
  const formData = {
    salesId: currentSales.value,
    planId: plan.planId,
  }

  try {
    const response = await salesApi.getPlanDetailBySales(formData);
    if (response.code === 0) {
      planDetail.value = response.data;

    } else {
      await NewAlert.show('注意！', '獲取創業計劃書詳情失敗:' + response.message);
    }
  } catch (error) {
    console.error('獲取創業計劃書詳情失敗:', error);
  }
}

const showPlanContractDialog = ref(false);
const planContractInfo = ref({});

async function openPlanContractDialog() {
  docDialogTitle.value = '合約';
  window.open(planContractInfo.value.finalContractUrl, '_blank')
}

function handleClosePlanContractDialog() {
  showPlanContractDialog.value = false;
  planContractInfo.value = {};
}

function handleCloseDocDialog() {
  showDocDialog.value = false;
  planDetail.value = {};
}

const prepareConstsTotal = computed(() => {
  if (!planDetail.value.planPrepareCosts) return 0;
  const costs = planDetail.value.planPrepareCosts;
  return (
      (costs.franchiseFee || 0) +
      (costs.decorationCosts || 0) +
      (costs.storeRentCosts || 0) +
      (costs.equipmentCosts || 0) +
      (costs.firstMaterialCost || 0) +
      (costs.paySalaryBudget || 0) +
      (costs.otherPersonnelCosts || 0) +
      (costs.marketingExpenses || 0) +
      (costs.cashFlow || 0) +
      (costs.otherCosts || 0)
  );
});


// Dialog 狀態
const showAddressDialog = ref(false)

// 表單資料
const addressForm = reactive({
  address: '',
})

// 錯誤訊息
const addressErrors = reactive({
  address: '',
})

// 打開 Dialog
function openAddressDialog(currentAddress = '') {
  // 如果有現有地址，預填
  addressForm.address = currentAddress

  // 清空錯誤訊息
  addressErrors.address = ''

  showAddressDialog.value = true
}

// 驗證表單
function validateAddressForm() {
  let isValid = true

  // 清空之前的錯誤
  addressErrors.address = ''

  // 驗證地址
  if (!addressForm.address || addressForm.address.trim() === '') {
    addressErrors.address = '請輸入地址'
    isValid = false
  } else if (addressForm.address.length < 5) {
    addressErrors.address = '請輸入完整地址'
    isValid = false
  }

  return isValid
}

// 提交地址
async function handleAddressSubmit() {
  // 驗證表單
  if (!validateAddressForm()) {
    return
  }

  try {
    const response = await salesCheckApi.checkAddressBySales({
      planId: planInfo.value.planId,
      salesId: currentSales.value,
      approved: true,
      remark: '',
      address: addressForm.address
    })

    if (response.code === 0) {
      showAddressDialog.value = false
      // 清空表單
      addressForm.address = ''
    }

    showAddressDialog.value = false
    addressForm.address = ''

  } catch (error) {
    await NewAlert.show('錯誤', '提交地址失敗，請洽客服人員。')
  }
}

// 取消
function handleAddressCancel() {
  showAddressDialog.value = false
  // 清空表單
  addressForm.address = ''
  addressErrors.address = ''
}

const getStatusText = (type, status) => {
  if (type === 'payment') {
    return status >= 1 ? '已支付上架費' : '未支付上架費';
  } else if (type === 'contract') {
    return status >= 1 ? '已簽約' : '未簽約';
  }
}
const getStatusClass = (type, status) =>
{
  const baseClass = 'tag';
  if (type === 'payment') {
    return status >= 1 ? `${baseClass} tag-success` : `${baseClass} tag-warning`;
  } else if (type === 'contract') {
    return status >= 1 ? `${baseClass} tag-success` : `${baseClass} tag-warning`;
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

.doc-tag {
  font-size: 14px;
  cursor: default;
  transition: all 0.2s ease;

  // 可點擊狀態
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

  // 禁用狀態
  &.disabled {
    color: #9e9e9e;
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none; // 只在 disabled 時禁用點擊
  }
}

.modal-content-wrapper {
  max-height: 60vh; // 視窗高度的 60%
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px; // 避免內容被滾動條遮住

  // 美化滾動條
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

  // Firefox 滾動條樣式
  scrollbar-width: thin;
  scrollbar-color: #ccc #f5f5f5;
}

.tag {
  display: inline-block;
  padding: 1px 4px;
  margin: 0 4px;
  border-radius: 4px;
  font-size: 14px;
}
.tag-success {
  background-color: #52c41a;
  color: white;
}
.tag-warning {
  background-color: #faad14;
  color: white;
}

// 共創者列表項目
.participant-item {
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  div {
    font-size: 14px;
    line-height: 1.8;
  }
}

// 高亮的共創者
.highlight-participant {
  background-color: #fff5f5;
  div {
    color: #ff6634;
    font-weight: 600;
  }
}

</style>
