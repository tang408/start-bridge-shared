<template xmlns="http://www.w3.org/1999/html">
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

            <div class="steps-footer mt-3 flex-column">
              <span class="status">媒合狀態：{{ p.stateText }}</span>
              <span class="status mt-2" v-if="p.remark !== '' && p.status < 0">原因：{{ p.remark }}</span>
            </div>
          </div>
          <button
              v-if="p.status < 0 || p.status === 2"
              type="button"
              class="btn-upload"
              @click.stop="handleButtonClick(p)"
          >
            審核不通過，請重新上傳資料
          </button>

          <button
              v-if="(p.status === 4 || p.status === 5)"
              type="button"
              class="btn-upload"
              :disabled="p.paymentStatus === 1"
              @click.stop="handleUploadData(p)"
          >
            上傳資料
          </button>

          <!-- 簽約立案按鈕 -->
          <button
              v-if="(p.status === 4 || p.status === 5)"
              type="button"
              class="btn-upload"
              :disabled="p.contractStatus === 1"
              @click.stop="handleSignContract(p)"
          >
            簽署平台合約
          </button>

          <button
              v-if="p.status === 7"
              type="button"
              class="btn-upload"
              @click.stop="handleButtonClick(p)"
          >
            我已簽屬完成
          </button>
          <button
              v-if="p.status === 12"
              type="button"
              class="btn-upload"
              @click.stop="handleButtonClick(p)"
          >
            上傳合約並支付服務費
          </button>
          <!--並排顯示-->
          <div v-if="p.status === 10 &isWithinOneWeekBeforeEnd(p.endTime)" class="">
            <span>專案即將結束，您可以選擇以下操作：</span>
            <button
                type="button"
                class="btn-expand"
                @click.stop="handleExtendProject(p)"
            >
              延長專案
            </button>
            <button
                type="button"
                class="btn-end"
                @click.stop="handleEndProject(p)"
            >
              結束專案
            </button>
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
  <!-- 預覽模式 -->
  <section v-else-if="mode === 'preview'">
    <div class="fs-24">
      {{ docTitle }} (預覽模式)
    </div>
    <component
        :is="currentStepComponent"
        v-model="formData[docStep]"
        :errors="formErrors[docStep]"
        :readonly="true"
        :step1Budget="formData.step1.budget"
        @next="goNext"
    />
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
        :step1Budget="formData.step1.budget"
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
      <!-- 顯示匯款資訊 -->
      <div class="form-group">
        <label>匯款資訊</label>
        <div class="readonly-field">
          銀行名稱：{{ bankInfo.bankName }}<br/>
          銀行代碼：{{ bankInfo.bankCode }}<br/>
          帳號：{{ bankInfo.bankAccount }}<br/>
          戶名：{{ bankInfo.bankAccountName }}
        </div>
      </div>
      <SharedInput
          id="accountLast5"
          label="帳號後五碼*"
          type="text"
          class="p-510"
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
          :account="uploadAccount"
          :type="'上架費匯款明細'"
          :id="currentUser.value"
      />
    </div>

  </SharedModal>

  <SharedModal
      v-model="showExtendDialog"
      title="延長專案"
      mode="submit"
      confirmText="確認延長"
      cancelText="取消"
      :showCancel="true"
      @submit="handleExtendSubmit"
  >
    <div class="extend-form">
      <div class="warning-section">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          此專案將延長合2個月，結束時間將延至 {{ extendedDate }}
        </div>
      </div>
      <div class="form-group">
        <label>提醒您：延長媒合期間已投入資源的創業夥伴有權撤回資源。</label>
      </div>

      <div class="confirm-question">
        請問是否確定延長？
      </div>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showEndPlanDialog"
      title="結束專案"
      mode="submit"
      confirmText="確認結束"
      cancelText="取消"
      :showCancel="true"
      @submit="handleEndPlanSubmit"
  >
    <div class="extend-form">
      <div class="warning-section">
        <div class="warning-icon">⚠️</div>
        <div class="confirm-question">
          請問是否確定結束專案？
        </div>
      </div>
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
      <div class="form-group">
        <label>匯款資訊</label>
        <div class="readonly-field">
          銀行名稱：{{ bankInfo.bankName }}<br/>
          銀行代碼：{{ bankInfo.bankCode }}<br/>
          帳號：{{ bankInfo.bankAccount }}<br/>
          戶名：{{ bankInfo.bankAccountName }}
        </div>
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
          :type="'創業者上傳合約'"
          :account="uploadAccount" :id="currentUser.value"/>


      <SharedUpload
          label="上傳付款憑證*"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="5"
          name="userPaymentProofFile"
          v-model="paymentForm.paymentProofName"
          :error="paymentErrors.paymentProof"
          @upload-success="(result) => handleUploadSuccess('userPaymentProofFile', result)"
          required
          :account="uploadAccount"
          :type="'服務費匯款明細'"
          :id="currentUser.value"/>
    </div>
  </SharedModal>

  <!-- 合約確認 Dialog -->
  <SharedModal
      v-model="showContractConfirmDialog"
      title="合約確認"
      mode="submit"
      confirmText="確認提交"
      cancelText="取消"
      :showCancel="true"
      @submit="handleContractConfirm"
      @cancel="handleContractCancel"
      class="contract-confirm-dialog"
  >
    <div class="contract-confirm-content">

      <div class="agreement-checkbox">
        <label class="checkbox-label">
          <input
              type="checkbox"
              v-model="contractAgreed"
              @change="contractErrors.agreement = ''"
          />
          <span class="checkbox-text">我已詳閱、同意平台合約並完成簽章。</span>
        </label>
        <div v-if="contractErrors.agreement" class="error-message">
          {{ contractErrors.agreement }}
        </div>
      </div>
    </div>
  </SharedModal>
</template>

<script setup>
import {useRouter, useRoute} from "vue-router";
import {ref, reactive, computed, onMounted, watch, nextTick} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import {statusLabel, statusClass} from "@/utils/status";
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
import {systemSettingApi} from "@/api/modules/systemSetting.js";

const {isLoggedIn, currentUser, currentUserName} = useAuth();

const uploadAccount = computed(() => {
  const userName = currentUserName.value
  const planId = paymentForm.planId
  return `${userName}_${planId}`
})

const showExtendDialog = ref(false);
const extendedDate = ref('');

const extendPlanId = ref(null);

function computeExtendedDate(originalEndTime) {
  // endTime = "2025-12-31"
  const originalDate = new Date(originalEndTime);
  const extendedDate = new Date(originalDate);
  extendedDate.setMonth(extendedDate.getMonth() + 2); // 延長兩個月

  const year = extendedDate.getFullYear();
  const month = String(extendedDate.getMonth() + 1).padStart(2, '0'); // 月份從0開始
  const day = String(extendedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function handleExtendProject(plan) {
  extendedDate.value = computeExtendedDate(plan.endTime);
  showExtendDialog.value = true;
  extendPlanId.value = plan.id;
}

async function handleExtendSubmit() {
  if (!extendPlanId.value) return;

  const response = await planApi.extendPlanDate({
    planId: extendPlanId.value,
    userId: currentUser.value,
  });

  if (response.code === 0) {
    alert("專案延長成功");
    showExtendDialog.value = false;
    // 重新載入頁面或更新資料
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    alert(response.message || "專案延長失敗，請稍後再試");
  }
}

const showEndPlanDialog = ref(false);
const endPlanId = ref(null);

function handleEndProject(plan) {
  showEndPlanDialog.value = true;
  endPlanId.value = plan.id;
}

async function handleEndPlanSubmit() {
  if (!endPlanId.value) return;

  const response = await planApi.endPlan({
    planId: endPlanId.value,
    userId: currentUser.value,
  });

  if (response.code === 0) {
    alert("專案結束成功");
    showEndPlanDialog.value = false;
    // 重新載入頁面或更新資料
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    alert(response.message || "專案結束失敗，請稍後再試");
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
const currentPlanId = ref(null);

async function toggle(planId) {
  console.log('點擊計畫 ID:', planId);
  expandedId.value = expandedId.value === planId ? null : planId;

  // 如果是展開,則載入該計畫資料並進入預覽模式
  if (expandedId.value === planId) {
    currentPlanId.value = planId;
    await loadPlanData(planId);

    await nextTick()

    // 切換到預覽模式並更新路由
    mode.value = 'preview';
    router.push({
      path: '/account/startup',
      query: {
        source: 'account',
        planId: planId,
        step: 'step1'
      }
    });
  }
}

async function loadPlanData(planId) {
  try {
    const requestData = {
      userId: currentUser.value,
      planId: planId,
    };

    const response = await planApi.getPlan(requestData);

    if (response.code === 0) {
      const planData = response.data;
      console.log('載入的計畫資料:', planData);

      // Step1 - 基本資料
      Object.assign(formData.step1, {
        brand: String(planData.brand || ''),
        budget: String(planData.startupBudget || ''),
        selfFund: String(planData.selfPreparedFunds || ''),
        totalFunding: String(planData.totalAmount || ''),
        minAmount: String(planData.minimumAmount || ''),
        amountRange: String(planData.amountRange || ''),
        partnerLimit: String(planData.limitPartner || ''),
      });

      // Step3 - 創業經驗
      Object.assign(formData.step3, {
        hasStartupExp: planData.hasExperience ? true : false,
        expDesc: planData.experienceDetails || '',
        hasDispute: planData.financialConstraints ? true : false,
        disputeDesc: planData.constraintsExplanation || '',
        selfAdv: planData.advantageExplanation || '',
        resources: planData.availableResources || '',
        otherResources: planData.otherResources || '',
        willingDocs: planData.supportDocumentation ? true : false,
      });

      // Step4 - 創業計畫
      Object.assign(formData.step4, {
        q1: planData.innovationDescription || '',
        q2: parseBriefingSession(planData.briefingSession),
        q3: planData.nextStagePlan || '',
        q4: parseRecruitmentMethods(planData.recruitmentMethods),
        q5: {
          total: {
            checked: true,
            value: String(planData.expectedNumberPeople || '')
          },
          channels: parseRecruitmentPipeline(planData.recruitmentPipeline)
        },
        q6: parseInvestTime(planData.investTime),
        q7: parseCustomerSource(planData.customerSource),
        q8Location: parseStoreLocation(planData.storeLocationType).value,
        q8LocationNote: parseStoreLocation(planData.storeLocationType).note,
        q9Location: parseCoFounderValue(planData.coFounderAddedValue).value,
        q9LocationNote: parseCoFounderValue(planData.coFounderAddedValue).note,
      });

      // Step5 - 財務規劃
      Object.assign(formData.step5, {
        prepBudget: [
          {item: "品牌加盟的相關費用", amount: String(planData.franchiseFee || '')},
          {item: "店面的裝潢設計工程", amount: String(planData.decorationCosts || '')},
          {item: "營運設備與生財器具", amount: String(planData.equipmentCosts || '')},
          {item: "開店前首批儲備物料", amount: String(planData.firstMaterialCost || '')},
          {item: "創業者預計支薪預算", amount: String(planData.paySalaryBudget || '')},
          {item: "籌備期其他人事成本", amount: String(planData.otherPersonnelCosts || '')},
          {item: "開店前品牌行銷費用", amount: String(planData.marketingExpenses || '')},
          {item: "營運週轉金及現金流", amount: String(planData.cashFlow || '')},
          {item: "其他（請說明）", amount: String(planData.otherCosts || '')},
          {
            item: "總計", amount: planData.franchiseFee &&
            planData.decorationCosts &&
            planData.equipmentCosts &&
            planData.firstMaterialCost &&
            planData.paySalaryBudget &&
            planData.otherPersonnelCosts &&
            planData.marketingExpenses &&
            planData.cashFlow &&
            planData.otherCosts
                ? String(
                    Number(planData.franchiseFee || 0) +
                    Number(planData.decorationCosts || 0) +
                    Number(planData.equipmentCosts || 0) +
                    Number(planData.firstMaterialCost || 0) +
                    Number(planData.paySalaryBudget || 0) +
                    Number(planData.otherPersonnelCosts || 0) +
                    Number(planData.marketingExpenses || 0) +
                    Number(planData.cashFlow || 0) +
                    Number(planData.otherCosts || 0)
                )
                : '',
          },
        ],
        costStruct: [
          {
            item: "物料成本",
            percent: String(planData.firstMaterialCostsPercent || ''),
            amount: String(planData.firstMaterialCostsAmount || ''),
            note: planData.firstMaterialCostsRemark || '',
            desc: "(含物料及包材)",
          },
          {
            item: "人事成本",
            percent: String(planData.personnelCostsPercent || ''),
            amount: String(planData.personnelCostsAmount || ''),
            note: planData.personnelCostsRemark || '',
            desc: "(含薪資及勞健保)",
          },
          {
            item: "租金成本",
            percent: String(planData.rentalCostsPercent || ''),
            amount: String(planData.rentalCostsAmount || ''),
            note: planData.rentalCostsRemark || '',
            desc: "(不含押金)",
          },
          {
            item: "經營管理成本",
            percent: String(planData.peratingCostsPercent || ''),
            amount: String(planData.peratingCostsAmount || ''),
            note: planData.peratingCostsRemark || '',
          },
          {
            item: "其他",
            percent: String(planData.otherCostsPercent || ''),
            amount: String(planData.otherCostsAmount || ''),
            note: planData.otherCostsRemark || '',
          },
          {
            item: "總計",
            percent: planData.firstMaterialCostsPercent &&
            planData.personnelCostsPercent &&
            planData.rentalCostsPercent &&
            planData.peratingCostsPercent &&
            planData.otherCostsPercent
                ? String(
                    Number(planData.firstMaterialCostsPercent || 0) +
                    Number(planData.personnelCostsPercent || 0) +
                    Number(planData.rentalCostsPercent || 0) +
                    Number(planData.peratingCostsPercent || 0) +
                    Number(planData.otherCostsPercent || 0)
                )
                : '',
            amount: planData.firstMaterialCostsAmount &&
            planData.personnelCostsAmount &&
            planData.rentalCostsAmount &&
            planData.peratingCostsAmount &&
            planData.otherCostsAmount
                ? String(
                    Number(planData.firstMaterialCostsAmount || 0) +
                    Number(planData.personnelCostsAmount || 0) +
                    Number(planData.rentalCostsAmount || 0) +
                    Number(planData.peratingCostsAmount || 0) +
                    Number(planData.otherCostsAmount || 0)
                )
                : '',
            note: '',
            desc: "(淨利，不含稅)",
          },
        ],
        targetRevenue: String(planData.turnoverTarget || ''),
        rewardEnabled: Boolean(planData.rewardThreshold),
        rewardAmount: String(planData.rewardThreshold || ''),
        rewardPercent: String(planData.rewardPercent || ''),
        fundNote: 1,
        reportSelected: parseReportSelected(planData.otherStatement),
        otherReport: parseOtherReport(planData.otherStatement),
      });

      // Step6 - 分潤條款
      Object.assign(formData.step6, {
        sharePeriod: parseProfitCycle(planData.profitDistributionCycle),
        shareCalc: parseProfitCalc(planData.profitCalculationMethod).value,
        shareCalcOther: parseProfitCalc(planData.profitCalculationMethod).other,
        sharePay: parseProfitPay(planData.profitPaymentMethod).value,
        sharePayOther: parseProfitPay(planData.profitPaymentMethod).other,
        agree: '',
      });

      await nextTick();
      console.log('載入計畫資料成功');
      console.log('formData:', formData);
    } else {
      alert('載入計畫資料失敗');
    }
  } catch (error) {
    console.error('載入計畫資料錯誤:', error);
    alert('載入計畫資料失敗');
  }
}

// ==================== 解析函數 ====================

// Step4: Q2 - 解析簡報會議 "否 (112233)"
function parseBriefingSession(text) {
  if (!text) return {};

  if (text.startsWith('是')) {
    const content = text.replace(/^是\s*\(|\)$/g, '').trim();
    return {yes: {checked: true, value: content}};
  } else if (text.startsWith('否')) {
    const content = text.replace(/^否\s*\(|\)$/g, '').trim();
    return {plan: {checked: true, value: content}};
  }

  return {};
}

// Step4: Q4 - 解析招募方式 "本人親自參與經營"
function parseRecruitmentMethods(text) {
  if (!text) return {};

  const result = {};
  const methods = text.split(',').map(m => m.trim());

  methods.forEach(method => {
    if (method.includes('本人親自參與經營')) {
      result.founder = {checked: true, value: ''};
    } else if (method.includes('邀約親友加入')) {
      const match = method.match(/邀約親友加入:\s*(.+)/);
      result.family = {checked: true, value: match ? match[1] : ''};
    } else if (method.includes('另行招募')) {
      const match = method.match(/另行招募:\s*(.+)/);
      result.recruit = {checked: true, value: match ? match[1] : ''};
    } else if (method.includes('其他')) {
      const match = method.match(/其他:\s*(.+)/);
      result.other = {checked: true, value: match ? match[1] : ''};
    }
  });

  return result;
}

// Step4: Q5.channels - 解析招募管道 "人力銀行"
function parseRecruitmentPipeline(text) {
  if (!text) return {};

  const result = {};
  const channels = text.split(',').map(c => c.trim());

  channels.forEach(channel => {
    if (channel.includes('人力銀行')) {
      result.jobBank = {checked: true, value: ''};
    } else if (channel.includes('社群平台')) {
      result.social = {checked: true, value: ''};
    } else if (channel.includes('親友介紹')) {
      result.referral = {checked: true, value: ''};
    } else if (channel.includes('門店張貼')) {
      result.poster = {checked: true, value: ''};
    } else if (channel.includes('其他')) {
      const match = channel.match(/其他:\s*(.+)/);
      result.other = {checked: true, value: match ? match[1] : ''};
    }
  });

  return result;
}

// Step4: Q6 - 解析投入時間 "全職投入並同步參與經營 16-24"
function parseInvestTime(text) {
  if (!text) return {};

  if (text.includes('全職投入並同步參與經營')) {
    const match = text.match(/(\d+)-(\d+)/);
    return {
      fulltime: {
        checked: true,
        from: match ? match[1] : '',
        to: match ? match[2] : ''
      }
    };
  } else if (text.includes('全職投入但隨機參與經營')) {
    const match = text.match(/(\d+)-(\d+)/);
    return {
      parttime: {
        checked: true,
        from: match ? match[1] : '',
        to: match ? match[2] : ''
      }
    };
  } else if (text.includes('其他')) {
    const match = text.match(/其他:\s*(.+)/);
    return {
      other: {
        checked: true,
        value: match ? match[1] : text
      }
    };
  }

  return {};
}

// Step4: Q7 - 解析客戶來源 "親友推薦"
function parseCustomerSource(text) {
  if (!text) return {};

  const result = {};
  const sources = text.split(',').map(s => s.trim());

  sources.forEach(source => {
    if (source.includes('親友推薦')) {
      result.social = {checked: true, value: ''};
    } else if (source.includes('過路散客')) {
      result.passenger = {checked: true, value: ''};
    } else if (source.includes('商圈經營')) {
      result.business = {checked: true, value: ''};
    } else if (source.includes('網路口碑')) {
      result.web = {checked: true, value: ''};
    } else if (source.includes('其他')) {
      const match = source.match(/其他:\s*(.+)/);
      result.other = {checked: true, value: match ? match[1] : ''};
    }
  });

  return result;
}

// Step4: Q8 - 解析門市地點 "住家型商圈"
function parseStoreLocation(text) {
  if (!text) return {value: '', note: {}};

  const locationMap = {
    '核心商圈': 'core',
    '住家型商圈': 'residential',
    '辦公型商圈': 'office',
    '學校周邊': 'school',
    '百貨商場': 'mall'
  };

  for (const [key, value] of Object.entries(locationMap)) {
    if (text.includes(key)) {
      return {value, note: {}};
    }
  }

  // 其他情況
  const match = text.match(/其他:\s*(.+)/);
  return {
    value: 'other',
    note: {other: match ? match[1] : text}
  };
}

// Step4: Q9 - 解析共創者附加價值 "推廣親友及資源"
function parseCoFounderValue(text) {
  if (!text) return {value: '', note: {}};

  const valueMap = {
    '協助經營': 'operation',
    '推廣親友及資源': 'network',
    '協助行銷': 'sales',
    '能協助籌資': 'finance',
    '獨立經營': 'independent'
  };

  for (const [key, value] of Object.entries(valueMap)) {
    if (text.includes(key)) {
      return {value, note: {}};
    }
  }

  // 其他情況
  const match = text.match(/其他:\s*(.+)/);
  return {
    value: 'other',
    note: {other: match ? match[1] : text}
  };
}

// Step5: 解析報表選項 "提供店內 POS 帳號並開啟營業報表權限"
function parseReportSelected(text) {
  if (!text) return '';

  const optionMap = {
    'POS': 'pos',
    '每月': 'monthly',
    '每季': 'season',
    '每年': 'yearly'
  };

  for (const [key, value] of Object.entries(optionMap)) {
    if (text.includes(key)) {
      return value;
    }
  }

  return 'other';
}

function parseOtherReport(text) {
  if (!text || !text.includes('其他')) return {};

  const match = text.match(/其他:\s*(.+)/);
  return match ? {other: match[1]} : {};
}

// Step6: 解析分潤週期 "每月結算並分潤一次(每一個月)"
function parseProfitCycle(text) {
  if (!text) return '';

  if (text.includes('每月')) return 'monthly';
  if (text.includes('每季')) return 'quarterly';
  if (text.includes('每半年')) return 'halfyear';
  if (text.includes('每年')) return 'yearly';

  return '';
}

// Step6: 解析分潤計算方式
function parseProfitCalc(text) {
  if (!text) return {value: '', other: {}};

  if (text.includes('同意依照')) {
    return {value: 'agree', other: {}};
  } else if (text.includes('其他')) {
    const match = text.match(/其他:\s*(.+)/);
    return {
      value: 'other',
      other: {other: match ? match[1] : text}
    };
  }

  return {value: '', other: {}};
}

// Step6: 解析分潤支付方式
function parseProfitPay(text) {
  if (!text) return {value: '', other: {}};

  if (text.includes('銀行匯款')) {
    return {value: 'bank', other: {}};
  } else if (text.includes('其他')) {
    const match = text.match(/其他:\s*(.+)/);
    return {
      value: 'other',
      other: {other: match ? match[1] : text}
    };
  }

  return {value: '', other: {}};
}

// 返回列表
function backToList() {
  mode.value = 'account';
  currentPlanId.value = null;
  expandedId.value = null;
  router.push({
    path: '/account/startup',
    query: {source: 'account'}
  });
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
  },
  step2: {file: null},
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
    q5: {total: "", channels: []},
    q6: {},
    q7: [],
    q8Location: "",
    q8LocationNote: {},
    q9Location: "",
    q9LocationNote: {},
  },
  step5: {
    prepBudget: [
      {item: "品牌加盟的相關費用", amount: ""},
      {item: "店面的裝潢設計工程", amount: ""},
      {item: "營運設備與生財器具", amount: ""},
      {item: "開店前首批儲備物料", amount: ""},
      {item: "創業者預計支薪預算", amount: ""},
      {item: "籌備期其他人事成本", amount: ""},
      {item: "開店前品牌行銷費用", amount: ""},
      {item: "營運週轉金及現金流", amount: ""},
      {item: "其他（請說明）", amount: ""},
      {item: "總計", amount: ""},
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
      {item: "其他", percent: "", amount: "", note: ""},
      {
        item: "總計",
        percent: "",
        amount: "",
        note: "",
        desc: "(淨利，不含稅)",
      },
    ],
    targetRevenue: "",
    rewardAmount: "",
    rewardPercent: "",

    fundNote: "",
    reportOptions: [
      {value: "pos", text: "提供店內 POS 帳號並開啟營業報表權限"},
      {value: "monthly", text: "每月/季「現金流量表」，需於次月 15 日前提供"},
      {
        value: "season",
        text: "每季/年度「財務報表」，需於當季後次月 15 日前提供",
      },
      {value: "yearly", text: "每年度「資產負債表」，需於次年一月底前提供"},
      {text: "其他", value: "other", withInput: true},
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
  step8: {agree: ""},
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
  },
  step2: {file: ""},
  step3: {hasStartupExp: ""},
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
  step8: {agree: ""},
});

function goNext(nextStep) {
  if (Object.keys(STEPS).includes(nextStep)) {
    docStep.value = nextStep;

    const query = {...route.query, step: nextStep};
    router.replace({query});
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
  router.replace({query: {...route.query, step}});
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
    {immediate: true}
);


watch(
    () => route.query,
    async (query) => {
      // 判斷模式
      if (query.source === 'account' && query.planId) {
        mode.value = 'preview';
        currentPlanId.value = parseInt(query.planId);
        // 如果有 planId,載入資料
        if (currentPlanId.value && !formData.step1.brand) {
          await loadPlanData(currentPlanId.value);
          await nextTick()
        }
      } else if (query.source === 'account') {
        mode.value = 'account';
        currentPlanId.value = null;
      } else if (query.source === 'business') {
        mode.value = 'business';
      }

      // 處理 step
      const qStep = (query.step || '').toString();
      if (Object.keys(STEPS).includes(qStep) && qStep !== docStep.value) {
        docStep.value = qStep;
      }
    },
    {immediate: true}
);

const progress = ref([
  {
    id: 1,
    status: "applying",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    progressStep: 3,
    stateText: "上傳合約",
    serviceCharge: 5,
    endTime: "2024-12-15",
    paymentStatus: 1,
    contractStatus: 1,
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
    franchiseFee: getBudgetAmount(step5.prepBudget, "品牌加盟的相關費用"),
    decorationCosts: getBudgetAmount(step5.prepBudget, "店面的裝潢設工程"),
    equipmentCosts: getBudgetAmount(step5.prepBudget, "營運設備與生財器具"),
    firstMaterialCost: getBudgetAmount(step5.prepBudget, "開店前首批儲備物料"),
    paySalaryBudget: getBudgetAmount(step5.prepBudget, "創業者預計支薪預算"),
    otherPersonnelCosts: getBudgetAmount(step5.prepBudget, "籌備期其他人事成本"),
    marketingExpenses: getBudgetAmount(step5.prepBudget, "開店前品牌行銷費用"),
    cashFlow: getBudgetAmount(step5.prepBudget, "營運週轉金及現金流"),
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
    profitPaymentMethod: getProfitPayText(step6.sharePay, step6.sharePayOther)
  };
}

async function createPlan() {
  const data = convertFormData(formData, currentUser.value);

  let response;

  // 判斷是編輯還是新建
  if (isEditMode.value && editPlanId.value) {
    // 更新現有計劃
    response = await planApi.updatePlan({
      ...data,
      planId: editPlanId.value
    });
  } else {
    // 新建計劃
    response = await planApi.createPlan(data);
  }

  if (response.code === 0) {
    alert(isEditMode.value ? "創業計劃書更新成功！" : "創業計劃書提交成功！");

    // 重置編輯狀態
    isEditMode.value = false;
    editPlanId.value = null;

    router.push("/account/startup");
    await getAllPlanByUser();
  } else {
    alert(isEditMode.value ? "創業計劃書更新失敗，請稍後再試。" : "創業計劃書提交失敗，請稍後再試。");
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

const systemSettingData = ref({})

const founderSignUrl = computed(() => {
  const setting = systemSettingData.value.find(item => item.type === 'founder_sign_url')
  return setting ? setting.value : ''
})

const bankInfo = computed(() => {
  // 把 array 轉成 object
  const settingsObject = systemSettingData.value.reduce((acc, item) => {
    acc[item.type] = item.value
    return acc
  }, {})

  return {
    bankCode: settingsObject.bank_code || '',
    bankAccount: settingsObject.bank_account || '',
    bankAccountName: settingsObject.bank_account_name || '',
    bankName: settingsObject.bank_name || ''
  }
})

async function getSystemSetting() {
  const formData = {
    userId: currentUser.value,
  }
  const res = await systemSettingApi.getSystemSetting(formData)
  if (res.code === 0) {
    systemSettingData.value = res.data
    console.log(systemSettingData.value)
  }
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
      serviceCharge: plan.serviceCharge,
      stateText: userPlanStepData.value.find(step => step.id === plan.currentStep)?.userStep || "無進度",
      remark: plan.remark || '',
      endTime: plan.endTime || null,
      paymentStatus: plan.paymentStatus || 0,
      contractStatus: plan.contractStatus || 0,
    }))
  } else {
    alert("取得創業計劃書列表失敗，請稍後再試。")
    return;
  }
}

// 判斷是否在結束日期前一週內
const isWithinOneWeekBeforeEnd = (endTime) => {
  if (!endTime) return false

  const today = new Date()
  const endDate = new Date(endTime)

  // 計算一週前的日期
  const oneWeekBefore = new Date(endDate)
  oneWeekBefore.setDate(endDate.getDate() - 7)

  // 判斷今天是否在「一週前」和「結束日期」之間
  return today >= oneWeekBefore && today <= endDate
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
  id: null,
  displayName: '',
  salesContractUrl: ''
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

// Dialog 狀態
const showContractConfirmDialog = ref(false)
const contractAgreed = ref(false)
const contractErrors = ref({})
const currentPlan = ref(null)

// 打開確認 Dialog
function openContractConfirmDialog(plan) {
  currentPlan.value = plan
  contractAgreed.value = false
  contractErrors.value = {}
  showContractConfirmDialog.value = true
}

// 新增一個 ref 來追蹤是否為編輯模式
const isEditMode = ref(false);
const editPlanId = ref(null);

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

  if (plan.status < 0 || plan.status === 2) {
    // 1. 設定編輯模式
    isEditMode.value = true;
    editPlanId.value = plan.id;

    // 2. 載入該計劃的資料
    await loadPlanData(plan.id);

    // 3. 設定為編輯模式
    mode.value = 'business';

    // 4. 跳轉到第一步
    docStep.value = 'step1';

    // 5. 更新路由
    router.push({
      path: '/account/startup',
      query: {
        source: 'business',
        planId: plan.id,
        step: 'step1',
        edit: 'true' // 標記為編輯模式
      }
    });

    return;
  }

  if (plan.status === 7) {
    openContractConfirmDialog(plan)
  }
  if (plan.status === 12) {
    showPaymentDialog.value = true;
    return;
  }
}

async function handleUploadData(plan) {
  paymentForm.planId = plan.id;
  paymentForm.userId = currentUser.value;
  paymentForm.amount = plan.serviceCharge;

  paymentErrors.contractFile = '';
  paymentErrors.paymentProof = '';
  paymentErrors.accountLast5 = '';

  showReleaseChargeDialog.value = true;
}

async function handleSignContract(plan) {
  const signUrl = founderSignUrl.value;

  if (!signUrl) {
    alert('簽署合約 URL 未設定，請聯繫管理員');
    return;
  }

  window.open(signUrl, '_blank');

  const formData = {
    planId: plan.id,
    userId: currentUser.value,
  };

  const res = await userCheckApi.signContractByUser(formData);
  if (res.code === 0) {
    await getAllPlanByUser();
  } else {
    alert(res.message || '合約簽署失敗，請稍後再試');
  }
}

async function handleContractConfirm() {
  // 驗證是否勾選
  if (!contractAgreed.value) {
    contractErrors.value = {
      agreement: '請勾選同意條款'
    }
    return
  }

  // 清除錯誤
  contractErrors.value = {}

  // 提交合約
  const formData = {
    planId: currentPlan.value.id,
    userId: currentUser.value,
  }

  try {
    const res = await userCheckApi.signContractSubmitByUser(formData)
    if (res.code === 0) {
      alert('已提交完成，請等待審核結果。')
      showContractConfirmDialog.value = false
      await getAllPlanByUser()
    } else {
      alert(res.message || '合約提交失敗，請稍後再試')
    }
  } catch (error) {
    console.error('提交合約失敗:', error)
    alert('合約提交失敗，請稍後再試')
  }
}

async function handleContractCancel() {
  showContractConfirmDialog.value = false
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
  if (currentStep >= 3 && currentStep < 4) {
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

  if (currentStep >= 14 && currentStep < 17) {
    return 6
  }

  if (currentStep >= 17 && currentStep < 22) {
    return 7
  }

  if (currentStep >= 22) {
    return 8
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    getAllPlanStep();
    getAllPlanByUser();
    getSystemSetting();
  }

  // 檢查初始路由
  const {source, planId, step} = route.query;

  if (source === 'account' && planId) {
    mode.value = 'preview';
    currentPlanId.value = parseInt(planId);
    loadPlanData(currentPlanId.value);
  } else if (source === 'account') {
    mode.value = 'account';
  } else if (source === 'business') {
    mode.value = 'business';
  }

  if (step && Object.keys(STEPS).includes(step)) {
    docStep.value = step;
  } else {
    setDocStep('step1');
  }
});

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

  // 新增 disabled 狀態樣式
  &:disabled {
    background: #cccccc;
    color: #666666;
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: #cccccc; // 禁用時 hover 不改變顏色
    }
  }
}

.btn-expand {
  background: #34b1ff;
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

.btn-end {
  background: #939393;
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

.payment-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 0 auto;
  font-family: "Noto Sans TC", sans-serif;
}

.payment-form .form-group {
  margin-bottom: 20px;
}

.payment-form label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
}

.readonly-field {
  background-color: #f7f9fc;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #1a202c;
  font-size: 15px;
  line-height: 1.7;
}

.readonly-field br {
  margin-bottom: 8px;
}

.p-510 {
  width: 100%;
}

/* 匯款資訊分隔線 & 強調 */
.payment-form .readonly-field {
  border-left: 4px solid #FF7F50FF;
}

/* Button or Upload CTA 我預留，可加在下方 */
.payment-form button,
.payment-form .submit-btn {
  width: 100%;
  padding: 14px;
  background: #4a90e2;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.payment-form button:hover {
  background: #357abd;
}

/* RWD 手機優化 */
@media (max-width: 480px) {
  .payment-form {
    padding: 16px;
  }
  .readonly-field {
    font-size: 14px;
  }
}

.confirm-question {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 2px dashed #dee2e6;
}

.contract-confirm-content {
  padding: 20px 0;

  .agreement-checkbox {
    margin-bottom: 24px;

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 12px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: #f8f9fa;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #1e90ff;
      }

      .checkbox-text {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
    }

    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 8px;
      margin-left: 32px;
    }
  }
}

</style>
