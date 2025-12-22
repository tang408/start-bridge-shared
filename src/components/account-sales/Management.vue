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
      <div>總媒合金額：{{ formatAmount(planInfo.planAmount) }} 元</div>
      <div>需求人數：{{ planInfo.planPartnerCount }} 人</div>
      <div v-if="planInfo.paymentStatus || planInfo.contractStatus">
        證明上傳狀態：
        <span :class="getStatusClass('payment', planInfo.paymentStatus)">{{
            getStatusText('payment', planInfo.paymentStatus)
          }}</span>
        <span :class="getStatusClass('contract', planInfo.contractStatus)">{{
            getStatusText('contract', planInfo.contractStatus)
          }}</span>
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

        <!-- 合約操作按鈕 -->
        <div v-if="shouldShowContractButtons()" class="contract-buttons mt-4">
          <button
              class="btn-save-contract"
              :disabled="planInfo.saveContract"
              @click="handleSaveContract"
          >
            {{ planInfo.saveContract ? '已保存合約' : '保存此合約' }}
          </button>

          <button
              class="btn-notify-contract"
              :disabled="!planInfo.saveContract || planInfo.isNotify"
              @click="handleNotifyAllUser"
          >
            {{ planInfo.isNotify ? '已通知雙方' : '通知雙方簽約' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ⭐ 只在特定狀態時顯示審核按鈕 -->
    <div v-if="shouldShowContactedButton()" class="review-btn-group">
      <button class="btn-pass" @click="handleApproveClick(selectedProject, true)">
        已聯繫
      </button>
    </div>

<!--    <div v-if="shouldShowCheckResourceButtons()" class="review-btn-group">-->
<!--      <button class="btn-pass" @click="handleApproveClick(selectedProject, true)">確認到位</button>-->
<!--    </div>-->

    <div v-else-if="shouldShowEndButtons()" class="review-btn-group">
      <button class="btn-pass" @click="handleApproveClick(selectedProject, true)">結案</button>
    </div>

    <div v-else-if="shouldShowHandOverButtons()" class="review-btn-group">
      <button class="btn-pass" @click="handleApproveClick(selectedProject, true)">已交接品牌</button>
    </div>

    <!-- 其他狀態：顯示「通過/不通過」按鈕 -->
    <div v-else-if="shouldShowReviewButtons()" class="review-btn-group">
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
                    <label>品牌加盟相關費用 ：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.franchiseFee?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>店面裝潢設計工程 ：</label>
                    <span>NT$ {{ planDetail.planPrepareCosts.decorationCosts?.toLocaleString() }}</span>
                  </div>
                  <div class="info-item">
                    <label>店面租賃兩押一租：</label>
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
                    <label>{{ planDetail.planPrepareCosts?.otherCostsTitle }}：</label>
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
                  <div class="info-item">
                    <label>退場機制：</label>
                    <span>{{ planDetail.planProfitSharing.exitMechanismConditions}}</span>
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
      v-model="showCertificationDialog"
      :title="certificationDialogTitle"
      mode="close"
      @update:modelValue="handleCloseCertificationDialog"
      class="doc-modal"
      titleAlign="center"
      :large="true"
  >
    <div class="modal-content-wrapper">
      <div class="modal-section text-center">
        <!-- 根據文件類型顯示不同內容 -->
        <img
            v-if="!isPdfFile(docDialogUrl)"
            :src="docDialogUrl"
            alt="文件預覽"
            class="doc-image"
        />
        <div v-else class="pdf-container">
          <iframe
              :src="docDialogUrl"
              class="pdf-viewer"
              title="PDF 預覽"
          ></iframe>
        </div>
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
    // ========== 創業者邏輯 ==========
    // 直接使用 currentStep
    const step = planSteps.value.find(s => s.id === row.currentStep);
    return step ? step.step : '未知狀態';

  } else {
    // ========== 共創者邏輯 ==========
    const status = row.currentCoreStep;
    const planCurrentStep = row.currentStep; // 創業者計畫步驟 (從 API 的 currentStep)

    // 🔧 如果 status > 0 且不等於 2 或 9，且 planCurrentStep >= 13
    if (status > 0 && status !== 2 && status !== 9) {
      if (planCurrentStep && planCurrentStep >= 13) {
        // 優先顯示自定義內容
        const customContent = getCustomContent(planCurrentStep);
        if (customContent) {
          return customContent;
        }

        // 如果沒有自定義內容，查找創業者計畫步驟
        const planStep = planSteps.value.find((s) => s.id === planCurrentStep);
        if (planStep) {
          return planStep.step;
        }

        return `步驟 ${planCurrentStep}`;
      }
    }

    // 否則顯示共創者的步驟
    const step = corePlanStep.value.find(s => s.id === status);
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
  return [
    {label: '全部', value: ''},
    {label: '創業者 (由近到遠)', value: 'founder-asc'},
    {label: '創業者 (由遠到近)', value: 'founder-desc'},
    {label: '共創者 (由近到遠)', value: 'core-asc'},
    {label: '共創者 (由遠到近)', value: 'core-desc'}
  ];
});

// 篩選和排序後的專案列表
const displayedProjects = computed(() => {
  let list = [...plans.value];

  // 1. 城市篩選
  if (projectFilter.city) {
    list = list.filter(p => p.city === projectFilter.city);
  }

  // 2. 狀態篩選（類型篩選）
  if (projectFilter.status) {
    const [type] = projectFilter.status.split('-');

    if (type === 'founder') {
      list = list.filter(p => p.planType === 1);
    } else if (type === 'core') {
      list = list.filter(p => p.planType === 2);
    }
  }

  // 3. 🔧 排序邏輯：後選的覆蓋前面的

  // 3.1 如果有日期排序,優先使用日期排序（後選的）
  if (projectFilter.dateOrder) {
    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (projectFilter.dateOrder === 'desc') {
        return dateB - dateA; // 新→舊
      } else {
        return dateA - dateB; // 舊→新
      }
    });
  }
  // 3.2 如果沒有日期排序,才使用狀態排序
  else if (projectFilter.status) {
    const [type, statusOrder] = projectFilter.status.split('-');

    list.sort((a, b) => {
      let stepA, stepB;
      if (type === 'founder') {
        stepA = a.currentStep;
        stepB = b.currentStep;
      } else if (type === 'core') {
        stepA = a.currentCoreStep;
        stepB = b.currentCoreStep;
      }

      if (statusOrder === 'asc') {
        return stepA - stepB; // 由近到遠
      } else {
        return stepB - stepA; // 由遠到近
      }
    });
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

const getCustomContent = (currentStep) => {
  const customContentMap = {
    13: '創業者前置準備中',
    14: '創業者前置準備中',
    15: '創業者已進入加盟流程',
    16: '創業者已進入加盟流程',
    17: '創業者已進入選址流程',
    18: '創業者已進入選址流程',
    19: '媒合完成 - 進入結案流程',
    20: '創業者已結案，平台審核中',
    21: '媒合完成 - 結案',
    23: '媒合成功 - 雙方簽約中'
  };

  return customContentMap[currentStep] || null;
}

// 🔧 修改 getParticipantStatus 函數
function getParticipantStatus(participant) {
  // participant 可能是步驟 ID (number) 或完整的參與者對象 (object)
  let status, planCurrentStep;

  if (typeof participant === 'number') {
    // 如果傳入的是步驟 ID
    status = participant;
    planCurrentStep = planInfo.value?.planStatus;
  } else {
    // 如果傳入的是完整對象
    status = participant.status;
    planCurrentStep = planInfo.value?.planStatus;
  }

  // 🔧 如果 status > 0 且不等於 2 或 9，且 planCurrentStep >= 13
  if (status > 0 && status !== 2 && status !== 9) {
    if (planCurrentStep && planCurrentStep >= 13) {
      // 優先顯示自定義內容
      const customContent = getCustomContent(planCurrentStep);
      if (customContent) {
        return customContent;
      }

      // 如果沒有自定義內容，查找創業者計畫步驟
      const planStep = planSteps.value.find((s) => s.id === planCurrentStep);
      if (planStep) {
        return planStep.step;
      }

      return `步驟 ${planCurrentStep}`;
    }
  }

  // 否則顯示共創者的步驟
  const coreStep = corePlanStep.value.find((s) => s.id === status);
  return coreStep ? coreStep.step : '未知狀態';
}

// 審核相關
const showRemarkDialog = ref(false);
const remark = ref('');
const currentProcessingRow = ref(null);

// 格式化 planInfo 的狀態
const formatPlanInfoStatus = () => {
  if (!planInfo.value.planStatus) return '未知狀態';

  // 根據是否有 participantPlanId 決定查詢哪個步驟列表
  // 創業者
  const step = planSteps.value.find(s => s.id === planInfo.value.planStatus);
  return step ? step.step : '未知狀態';

}
const shouldShowCheckResourceButtons = () => {
  if (!planInfo.value) return false;

  if (!planInfo.value.planStatus) return false;

  // 創業者可審核資源到位的步驟
  const founderCheckResourceSteps = [13];
  return founderCheckResourceSteps.includes(planInfo.value.planStatus);

}
// 判斷是否應該顯示審核按鈕
const shouldShowContactedButton = () => {
  if (!planInfo.value) return false;

  const isParticipant = !!planInfo.value.participantPlanId;

  // 只在共創者進度 10 時顯示
  if (!isParticipant) return false;
  if (!planInfo.value.participantPlanStep) return false;

  // 檢查證明是否已上傳
  const hasValidIdc = planInfo.value.coreFounderIdc &&
      planInfo.value.coreFounderIdc !== 0;
  const hasValidSecondIdc = planInfo.value.coreFounderSecondIdc &&
      planInfo.value.coreFounderSecondIdc !== 0;

  if (!hasValidIdc || !hasValidSecondIdc) {
    return false;
  }

  // 只在步驟 10 顯示
  return planInfo.value.participantPlanStep === 10;
}

// 判斷是否顯示「通過/不通過」按鈕（其他可審核狀態）
const shouldShowReviewButtons = () => {
  if (!planInfo.value) return false;

  const isParticipant = !!planInfo.value.participantPlanId;

  if (isParticipant) {
    if (!planInfo.value.participantPlanStep) return false;

    // 檢查證明是否已上傳
    const hasValidIdc = planInfo.value.coreFounderIdc &&
        planInfo.value.coreFounderIdc !== 0;
    const hasValidSecondIdc = planInfo.value.coreFounderSecondIdc &&
        planInfo.value.coreFounderSecondIdc !== 0;

    if (!hasValidIdc || !hasValidSecondIdc) {
      return false;
    }

    // 共創者可審核的步驟（排除步驟 10）
    const participantReviewableSteps = [1];
    return participantReviewableSteps.includes(planInfo.value.participantPlanStep);
  } else {
    // 創業者邏輯
    if (!planInfo.value.planStatus) return false;

    const hasValidIdc = planInfo.value.founderIdc &&
        planInfo.value.founderIdc !== 0;
    const hasValidPcrc = planInfo.value.founderPcrc &&
        planInfo.value.founderPcrc !== 0;
    const hasValidAssetsc = planInfo.value.founderAssetsc &&
        planInfo.value.founderAssetsc !== 0;

    if (!hasValidIdc || !hasValidPcrc || !hasValidAssetsc) {
      return false;
    }


    const founderReviewableSteps = [1];
    return founderReviewableSteps.includes(planInfo.value.planStatus);
  }
}

const shouldShowHandOverButtons = () => {
  if (!planInfo.value) return false;
  if (!planInfo.value.planStatus) return false;

  // 🆕 Step 15 需要額外檢查 companyStatus
  if (planInfo.value.planStatus === 15) {
    // companyStatus 必須等於 1 (已填寫公司資料)
    if (planInfo.value.companyStatus !== 1) {
      return false;
    }
  }

  // 創業者可交接的步驟
  const founderHandOverSteps = [15];
  return founderHandOverSteps.includes(planInfo.value.planStatus);

}

const shouldShowEndButtons = () => {
  if (!planInfo.value) return false;


  if (!planInfo.value.planStatus) return false;

  if (planInfo.value.participantPlanId) return false;

  // 創業者可結案的步驟
  const founderEndSteps = [19];
  return founderEndSteps.includes(planInfo.value.planStatus);

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

const openCertificationDialog = (type, url) => {
  console.log(type, url)
  showCertificationDialog.value = true
  docDialogUrl.value = url
  currentDocType.value = type
}

// 判斷是否為 PDF 文件
const isPdfFile = (url) => {
  if (!url) return false
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')
}

// 關閉認證文件對話框
function handleCloseCertificationDialog() {
  showCertificationDialog.value = false
  docDialogUrl.value = ''
  currentDocType.value = ''
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

  if (plan.documentUrl !== null && plan.documentUrl !== '' ) {
    window.open(plan.documentUrl, '_blank')
    return;
  }

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

// ==================== 合約操作相關 ====================

function shouldShowContractButtons() {
  if (planInfo.value.planStatus < 1 ||
      planInfo.value.planStatus === 2 ||
      planInfo.value.planStatus === 9) {
    return false;
  }

  // 判斷是創業者還是共創者
  const isParticipant = !!planInfo.value.participantPlanId; // 有 participantPlanId 表示是共創者

  if (isParticipant) {
    return false;
  }

  // 檢查是否有共創者
  if (!planInfo.value.participantPlanInfo || planInfo.value.participantPlanInfo.length === 0) {
    return false;
  }

  // 檢查所有共創者是否都同意合約條款
  const allAgreed = planInfo.value.participantPlanInfo.every(
      participant => participant.agreeTerms === true
  );

  return allAgreed;
}

// 保存合約
async function handleSaveContract() {
  try {
    const formData = {
      salesId: currentSales.value,
      planId: planInfo.value.planId,
    };

    const response = await salesCheckApi.saveContractBySales(formData);

    if (response.code === 0) {
      planInfo.value.saveContract = true;
      await NewAlert.show("成功", "合約已保存");
      showModal.value = false;
    } else {
      await NewAlert.show("失敗", response.message || "保存合約失敗");
      showModal.value = false;

    }
  } catch (error) {
    console.error('保存合約失敗:', error);
    await NewAlert.show("錯誤", "保存合約時發生錯誤");
  }
}

// 通知雙方簽約
async function handleNotifyAllUser() {
  try {
    const formData = {
      salesId: currentSales.value,
      planId: planInfo.value.planId,
    };

    const response = await salesCheckApi.notifyAllUserBySales(formData);

    if (response.code === 0) {
      planInfo.value.isNotify = true;
      await NewAlert.show("成功", "已通知雙方簽約");
      showModal.value = false;
      await getAllPlanBySales();
    } else {
      await NewAlert.show("失敗", response.message || "通知失敗");
      showModal.value = false;
    }
  } catch (error) {
    console.error('通知失敗:', error);
    await NewAlert.show("錯誤", "通知時發生錯誤");
  }
}

const getStatusText = (type, status) => {
  if (type === 'payment') {
    return status >= 1 ? '已支付上架費' : '未支付上架費';
  } else if (type === 'contract') {
    return status >= 1 ? '已簽約' : '未簽約';
  }
}
const getStatusClass = (type, status) => {
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

// 合約操作按鈕
.contract-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 576px) {
    flex-direction: column;
  }
}

.btn-save-contract,
.btn-notify-contract {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  @media (max-width: 576px) {
    width: 100%;
  }

  &:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.btn-save-contract {
  background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #45a049 0%, #3d8b40 100%);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
}

.btn-notify-contract {
  background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #f57c00 0%, #e65100 100%);
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
}

// PDF 容器和查看器樣式
.pdf-container {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;

  @media (max-width: 768px) {
    height: 60vh;
    min-height: 400px;
  }
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  background: #f5f5f5;
}

.doc-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;

  @media (max-width: 768px) {
    max-height: 60vh;
  }
}

</style>
