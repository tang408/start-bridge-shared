<template>
  <div class="fs-24">參與專案管理</div>

  <section v-if="mode === 'account'">
    <SharedTabs
        v-model="activeTab"
        :tabs="[
        { label: '共創進度', value: 'progress' },
        { label: '共創明細', value: 'details' },
        { label: '共創紀錄', value: 'records' },
      ]"
    />

    <!-- 共創進度 -->
    <div v-if="activeTab === 'progress'" class="stack">
      <article
          v-for="p in projects"
          :key="p.id"
          class="article-card"
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
          {{ statusLabel(p.status) }}
        </span>
            <span class="time" v-if="isRunning(p.status)">
          剩餘 {{ p.lastUpdate }}
        </span>
          </header>

          <div class="gap-1 d-grid">
            <div class="title">{{ p.title }}</div>
            <div class="content mt-2">{{ p.content }}</div>
          </div>

          <!-- 🆕 修改進度條部分 -->
          <div class="progress-wrap">
            <!-- 雙層進度條 -->
            <div class="progress-bar-container">
              <div class="progress-bar-wrapper">
                <!-- 橘色進度條（已完成）-->
                <div
                    class="progress-bar-fill completed"
                    :style="{ width: `${p.completedProgress || 0}%` }"
                >
              <span class="progress-text" v-if="(p.completedProgress || 0) > 5">
                {{ p.completedProgress }}%
              </span>
                </div>

                <!-- 灰色進度條（審核中）-->
                <div
                    class="progress-bar-fill pending"
                    :style="{
                  width: `${p.pendingProgress || 0}%`,
                  left: `${p.completedProgress || 0}%`
                }"
                >
              <span class="progress-text" v-if="(p.pendingProgress || 0) > 5">
                {{ p.pendingProgress }}%
              </span>
                </div>
              </div>
            </div>

            <!-- 保持原有的文字顯示 -->
            <div class="progress-footer mt-2">
              <span class="dollar">已達成金額 {{ fmtMoney(p.completedAmount) }}</span>
              <span class="remain">還差 {{ fmtMoney(p.remainingAmount) }}</span>
            </div>
          </div>
        </button>
      </article>
    </div>

    <!-- 共創明細 -->
    <div v-else-if="activeTab === 'details'" class="details">
      <article
          v-for="p in details"
          :key="p.id"
          class="article-card"
          :class="{ expanded: expandedDetailsId === p.id }"
      >
        <button
            type="button"
            class="summary"
            @click="toggleDetails(p.id)"
            :aria-expanded="expandedDetailsId === p.id ? 'true' : 'false'"
            :aria-controls="`details-${p.id}`"
        >
          <header class="card-head">
            <span class="status-pill" :class="statusClass(p.status)">
              {{ statusLabel(p.status) }}
            </span>
            <span class="time" v-if="isRunning(p.status)">
              剩餘 {{ p.lastUpdate }}
            </span>
            <span class="time" v-if="p.status === 'match-failed'">退款中</span>
          </header>

          <div class="title">{{ p.title }}</div>
          <div>
            <div class="detail-panel" :id="`details-${p.id}`">
              <div class="tx-list">
                <div
                    v-for="(t, i) in p.transactions"
                    :key="i"
                    class="tx-row"
                >
                  <div class="tx-date">{{ t.date }}</div>

                  <!-- 根據狀態顯示不同按鈕 -->
                  <div class="tx-btn">
                    <button
                        v-if="t.status === 5"
                        type="button"
                        @click="handleSignCoreContract(t, p)"
                    >
                      簽名
                    </button>

                    <button
                        v-if="t.status === 6"
                        type="button"
                        @click="handleSignCoreContractSubmit(t, p)"
                    >
                      我已簽署完成
                    </button>

                    <button
                        v-if="t.status === 11"
                        type="button"
                        @click="handlePayServiceFee(t, p)"
                    >
                      支付服務費
                    </button>

                    <button
                        v-if="t.status === 13"
                        type="button"
                        @click="handleUploadCorePlanFinalContract(t, p)"
                    >
                      上傳合約
                    </button>
                  </div>
                  <div class="tx-label">{{ t.invest }}</div>
                  <div class="tx-status">
                    {{ txStatusLabel(t.statusKey) }}
                  </div>
                  <div class="tx-amount">{{ fmtMoney(t.amount) }}</div>
                </div>
              </div>
              <hr/>
            </div>

            <div class="details-dollar d-flex justify-content-end">
              <span>共創總額</span>
              <span class="details-dollar-content">
                {{ fmtMoney(p.dollar) }}
              </span>
            </div>

            <!-- 增加金額表單 -->
            <div class="form-row mt-5" v-if="p.status === 'running'">
              <input
                  type="text"
                  class="form-input"
                  v-model="p.increaseAmountStr"
                  @input="onAmountInput(p)"
                  @blur="onAmountBlur(p)"
                  inputmode="numeric"
                  placeholder="請輸入追加金額"
              />
              <button
                  type="button"
                  class="btn-dollar"
                  @click="handleIncrease(p)"
              >
                增加金額
              </button>
            </div>
          </div>
        </button>
      </article>
    </div>

    <!-- 共創紀錄 -->
    <div v-else-if="activeTab === 'records'" class="records">
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
            :options="actionOptions"
        />

        <SharedDropdown
            v-model="recFilter.status"
            placeholder="依狀態排序"
            :options="statusFilterOptions"
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
      </div>

      <div class="table-wrap">
        <table class="records-table">
          <thead>
          <tr>
            <th width="12%">時間</th>
            <th width="50%">專案名稱</th>
            <th width="13%">動作</th>
            <th width="13%">狀態</th>
            <th width="12%" class="ta-right">金額</th>
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
            <td class="ta-right" data-th="金額">
              {{ fmtMoney(row.amount) }}
            </td>
          </tr>
          <tr v-if="!displayedRecords.length">
            <td colspan="5" class="empty">目前沒有符合條件的紀錄</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Brand 模式 -->
  <section v-else class="details">
    <article
        v-for="p in projectsData"
        :key="p.id"
        class="article-card"
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
            {{ statusLabel(p.status) }}
          </span>
          <span class="time" v-if="isRunning(p.status)">
            剩餘 {{ p.lastUpdate }}
          </span>
        </header>

        <div class="gap-1 d-grid">
          <div class="title">{{ p.title }}</div>
          <div class="content">{{ p.content }}</div>
        </div>

        <div>
          <div class="progress-wrap" v-if="p.status !== 'applying' && p.progress !== undefined">
            <div
                class="progress-bar"
                role="progressbar"
                :aria-valuemin="0"
                :aria-valuemax="100"
                :aria-valuenow="p.progress"
            >
              <div
                  class="progress-inner"
                  :style="{ width: p.progress + '%' }"
              ></div>
              <div class="progress-text">募資進度 {{ p.progress }}%</div>
            </div>

            <div class="progress-footer mt-2">
              <span class="dollar">已達成金額 {{ fmtMoney(p.dollar) }}</span>
              <span class="remain">還差 {{ fmtMoney(p.remain) }}</span>
            </div>
          </div>

          <hr/>

          <!-- 同意條款 -->
          <div class="form-group">
            <div class="agree-row">
              <input id="agree" type="checkbox" v-model="form.agree"/>
              <label for="agree">我已閱讀並同意</label>
              <a href="/terms/risk" class="agree-link" target="_blank" @click.stop>
                參與風險聲明
              </a>
              及
              <a href="/terms/risk" class="agree-link" target="_blank" @click.stop>
                平台免責聲明
              </a>
            </div>
            <p class="error-msg" v-if="errors.agree">{{ errors.agree }}</p>
          </div>

          <!-- 參與共創表單 -->
          <div class="form-row mt-3">
            <input
                type="number"
                class="form-input"
                v-model.number="p.increaseAmount"
                min="0"
                placeholder="請輸入參與金額"
            />
            <button
                type="button"
                class="btn-dollar"
                @click="participate(p)"
            >
              參與共創
            </button>
          </div>
          <div class="dollar">
            <div class="py-2">單筆最低參與金額：{{ fmtMoney(p.minimumAmount) }} 元</div>
            <div>額度級距：{{ fmtMoney(p.amountRange) }} 元</div>
          </div>
        </div>
      </button>
    </article>
  </section>

  <!-- 支付服務費 Dialog -->
  <SharedModal
      v-model="showPaymentDialog"
      title="上傳支付資料"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handlePaymentSubmit"
      @cancel="handlePaymentCancel"
  >
    <div class="payment-form">
      <div class="form-group">
        <label>支付金額</label>
        <div class="readonly-field">
          {{ formatAmount(paymentForm.amount) }} 元
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
          maxlength="5"
      />

      <SharedUpload
          label="上傳付款憑證*"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="5"
          name="userPaymentProofFile"
          v-model="paymentForm.paymentProofName"
          :error="paymentErrors.paymentProof"
          @upload-success="handleUploadSuccess"
          required
          :account="uploadAccount"
          :type="'共創者服務費匯款明細'"
          :id="currentUser"
      />
    </div>
  </SharedModal>

  <SharedModal
    v-model="showCorePlanFinalContractDialog"
    title="合約上傳"
    mode="submit"
    confirmText="確認上傳"
    cancelText="取消"
    :showCancel="true"
    @submit="handleCorePlanFinalContractSubmit"
  >
    <div class="form-group">
      <SharedUpload
        id="corePlanFinalContractFile"
        accept=".pdf,.jpg,.jpeg,.png"
        :max-size="10"
        name="corePlanFinalContract"
        v-model="corePlanFinalContractFileName"
        :error="corePlanFinalContractError"
        :account="uploadAccount"
        :type="'共創者上傳合約'"
        :id="currentUser"
       label="上傳最終合約文件*"/>
    </div>
  </SharedModal>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {ref, reactive, computed, onMounted, watch} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import {
  statusLabel,
  statusClass,
  isRunning,
  txStatusLabel,
} from "@/utils/status";
import {useAuth} from "@/composables/useAuth.js";
import {planApi} from "@/api/modules/plan.js";
import {userCheckApi} from "@/api/modules/userCheck.js";
import {systemSettingApi} from "@/api/modules/systemSetting.js";
import {NewAlert} from "@/composables/useAlert.js";

const {isLoggedIn, currentUser, currentUserName} = useAuth();
const router = useRouter();
const route = useRoute();

const uploadAccount = computed(() => {
  const userName = currentUserName.value
  const planId = paymentForm.participantPlanId
  return `${userName}_${planId}`
})

// Props
const props = defineProps({
  entry: {type: String, default: "account"},
  preselectTab: {type: String, default: "progress"},
  brandId: {type: [Number, String, null], default: null},
  brandName: {type: String, default: ""},
});

// ==================== 狀態管理 ====================
const activeTab = ref("progress");
const expandedId = ref(null);
const expandedDetailsId = ref(null);
const mode = ref("account");

// 表單
const form = reactive({agree: false});
const errors = reactive({agree: ""});

// 數據
const projects = ref([]);
const details = ref([]);
const records = ref([]);
const projectsData = ref([]);

// 篩選
const recFilter = reactive({
  timeOrder: "",
  action: "",
  status: "",
  amountOrder: "",
});

// 支付表單
const showPaymentDialog = ref(false);
const paymentForm = reactive({
  participantPlanId: null,
  userId: null,
  accountLast5: "",
  amount: 0,
  paymentProof: null,
  paymentProofName: "",
});

const paymentErrors = reactive({
  accountLast5: "",
  paymentProof: "",
});

// 當前選中的數據
const selectedTransaction = ref(null);
const selectedPlan = ref(null);

const systemSettingData = ref({})

const coreFounderSignUrl = computed(() => {
  const setting = systemSettingData.value.find(item => item.type === 'core_founder_sign_url')
  return setting ? setting.value : ''
})

// ==================== Computed ====================

// 動作篩選選項
const actionOptions = computed(() => [
  {label: '全部', value: ''},
  {label: '初次投入', value: '初次投入'},
  {label: '追加投入', value: '追加投入'},
  {label: '退款', value: '退款'},
  {label: '取消', value: '取消'},
]);

// 狀態篩選選項
const statusFilterOptions = computed(() => [
  {label: '全部', value: ''},
  {label: '成功', value: '成功'},
  {label: '失敗', value: '失敗'},
  {label: '處理中', value: '處理中'},
]);

// 排序 + 篩選後的記錄
const displayedRecords = computed(() => {
  let list = [...records.value];

  // 動作篩選
  if (recFilter.action) {
    list = list.filter((r) => r.action === recFilter.action);
  }

  // 狀態篩選
  if (recFilter.status) {
    list = list.filter((r) => r.status === recFilter.status);
  }

  // 時間排序
  if (recFilter.timeOrder) {
    list.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return recFilter.timeOrder === "asc" ? ta - tb : tb - ta;
    });
  }

  // 金額排序
  if (recFilter.amountOrder) {
    list.sort((a, b) =>
        recFilter.amountOrder === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount
    );
  }

  return list;
});

// ==================== Methods ====================

// 切換展開
function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

function toggleDetails(id) {
  expandedDetailsId.value = expandedDetailsId.value === id ? null : id;
}

// 格式化金額
function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString("zh-Hant-TW");
}

function formatAmount(amount) {
  return fmtMoney(amount);
}

// 計算剩餘時間
function calculateTimeRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff <= 0) return "已結束";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}天 ${hours}小時 ${minutes}分`;
}

// 格式化狀態 key
function formatStatusKey(status) {
    if (status > 0 && status <= 8) return 'pending';
    if (status > 8 && status !== 9) return 'success';
    if (status === 9 || status < 0) return 'failed';
    return 'unknown';
}

// 映射計畫狀態
function mapPlanStatus(currentStep) {
  if (currentStep === 9) return 'running';
  if (currentStep === 10) return 'running';
  if (currentStep === 11 || currentStep === 2) return 'match-failed';
  if (currentStep >= 12) return 'match-success';
  if (currentStep < 0) return 'match-failed';
  return 'pending-start';
}

// ==================== API 調用 ====================

// 獲取所有參與計畫
async function getAllParticipantPlanByUser() {
  try {
    const response = await planApi.getAllParticipantPlanByUser({
      userId: currentUser.value,
    });

    if (response.code === 0 && response.data !== null) {
      projects.value = response.data.map((plan) => {
        const progress = plan.targetAmount > 0
            ? Math.min(Math.round((plan.totalParticipantAmount / plan.targetAmount) * 100), 100)
            : 0;

        const remain = Math.max(plan.targetAmount - plan.totalParticipantAmount, 0);
        const status = mapPlanStatus(plan.currentStep);

        return {
          id: plan.planId,
          status: status,
          lastUpdate: calculateTimeRemaining(plan.endDate),
          title: plan.planName,
          content: statusLabel(status),
          progress: progress,
          completedProgress: plan.completedProgress || 0,
          pendingProgress: plan.pendingProgress || 0,
          completedAmount: plan.completedAmount || 0,
          pendingAmount: plan.pendingAmount || 0,
          remainingAmount: plan.remainingAmount || 0,
          dollar: plan.totalParticipantAmount,
          remain: remain,
          goal: plan.targetAmount,
          showFundBox: true,
          fav: false,
        };
      });
    } else {
      console.error('獲取參與計畫失敗:', response.message);
    }
  } catch (error) {
    console.error('獲取參與計畫錯誤:', error);
  }
}

// 獲取參與計畫明細
async function getAllParticipantPlanDetailByUser() {
  try {
    const response = await planApi.getAllParticipantPlanDetailByUser({
      userId: currentUser.value,
    });

    if (response.code === 0 && response.data !== null) {
      details.value = response.data.map((plan) => {
        const status = mapPlanStatus(plan.currentStep);
        const transactions = plan.participantData.map((tx) => ({
          id: tx.id,
          date: tx.date,
          status: tx.status,
          statusKey: formatStatusKey(tx.status),
          amount: tx.amount,
          invest: tx.action === 1 ? '初次投入' : '追加投入',
        }));

        return {
          id: plan.planId,
          status: status,
          lastUpdate: calculateTimeRemaining(plan.endDate),
          title: plan.planName,
          dollar: plan.participantTotalAmount,
          transactions: transactions,
          increaseAmountStr: '',
        };
      });
    } else {
      console.error('獲取計畫明細失敗:', response.message);
    }
  } catch (error) {
    console.error('獲取計畫明細錯誤:', error);
  }
}

// 獲取參與記錄
async function getAllParticipantPlanRecordByUser() {
  try {
    const response = await planApi.getAllParticipantPlanRecordByUser({
      userId: currentUser.value,
    });

    if (response.code === 0 && response.data !== null) {

      records.value = response.data.map((record) => {
        const actionMap = {
          1: '初次投入',
          2: '追加投入',
          3: '退款',
          4: '取消',
        };

        const statusMap = {
          0: '平台審核中',
          1: '成功',
          2: '失敗',
        };
        return {
          id: record.id,
          date: record.date,
          title: record.planName,
          action: actionMap[record.action] || '未知',
          status: statusMap[record.transactionStatus] || '未知',
          amount: record.amount,
        };
      });
    } else {
      console.error('獲取參與記錄失敗:', response.message);
    }
  } catch (error) {
    console.error('獲取參與記錄錯誤:', error);
  }
}

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

// 獲取單一品牌計畫（brand 模式）
async function getParticipantPlan() {
  try {
    const response = await planApi.getParticipantPlan({
      userId: currentUser.value,
      planId: Number(route.query.planId),
    });

    if (response.code === 0) {
      const plan = response.data;
      const progress = plan.targetAmount > 0
          ? Math.min(Math.round((plan.totalParticipantAmount / plan.targetAmount) * 100), 100)
          : 0;

      const remain = Math.max(plan.targetAmount - plan.totalParticipantAmount, 0);
      const status = mapPlanStatus(plan.currentStep);

      projectsData.value = [{
        id: plan.planId,
        status: status,
        lastUpdate: calculateTimeRemaining(plan.endDate),
        title: plan.planName,
        content: statusLabel(status),
        minimumAmount: plan.minimumAmount,
        limitPartner: plan.limitPartner,
        amountRange: plan.amountRange,
        totalParticipantPartner: plan.totalParticipantPartner,
        progress: progress,
        dollar: plan.totalParticipantAmount,
        remain: remain,
        goal: plan.targetAmount,
        increaseAmount: 0,
      }];
    } else {
      await NewAlert.show("獲取品牌計畫失敗", response.message + " ,請洽客服人員。");
    }
  } catch (error) {
    console.error('獲取品牌計畫錯誤:', error);
  }
}

// ==================== 用戶操作 ====================

// 參與共創
async function participate(p) {
  errors.agree = "";

  if (!p.increaseAmount || p.increaseAmount <= 0) {
    await NewAlert.show("輸入錯誤", "請輸入有效的參與金額。");
    return;
  }

  if (p.totalParticipantPartner >= p.limitPartner) {
    await NewAlert.show("參與失敗", "此共創專案的參與名額已滿，無法再參與。");
    return;
  }

  if (p.increaseAmount < p.minimumAmount) {
    await NewAlert.show("輸入錯誤", `參與金額不可低於最低參與金額 ${fmtMoney(p.minimumAmount)} 元。`);
    return;
  }

  if (p.increaseAmount > p.goal - p.dollar) {
    await NewAlert.show("輸入錯誤", `參與金額不可超過剩餘可參與金額 ${fmtMoney(p.goal - p.dollar)} 元。`);
    return;
  }

  if (p.increaseAmount % p.amountRange !== 0) {
    await NewAlert.show("輸入錯誤", `參與金額須為額度級距 ${fmtMoney(p.amountRange)} 元 的整數倍。`);
    return;
  }



  if (!form.agree) {
    errors.agree = "請同意風險聲明及平台免責聲明";
    return;
  }

  try {
    const response = await planApi.participantPlan({
      userId: currentUser.value,
      planId: Number(route.query.planId),
      amount: p.increaseAmount,
    });

    if (response.code === 0) {
      const result = await NewAlert.confirm("共創專案提交成功","請前往「個人專區」上傳相關文件。")
      if (result) {
        await router.push({ path: "/account/profile" });
      } else {
        await router.push('/account/participation');
        await refreshAllData();
      }
    } else {
      await NewAlert.show("參與失敗", response.message + " ,請洽客服人員。");
    }
  } catch (error) {
    console.error('參與共創錯誤:', error);
    await NewAlert.show("參與失敗", "請洽客服人員。");
  }
}

// 增加金額
async function handleIncrease(plan) {
  const amount = parseFloat(plan.increaseAmountStr);

  if (!amount || amount <= 0 || isNaN(amount)) {
    await NewAlert.show("輸入錯誤", "請輸入有效的追加金額。");
    return;
  }

  try {
    const response = await planApi.participantPlan({
      userId: currentUser.value,
      planId: plan.id,
      amount: amount,
    });

    if (response.code === 0) {
      await NewAlert.show("追加成功", "您的追加金額已成功提交。");
      plan.increaseAmountStr = '';
      await refreshAllData();
    } else {
      await NewAlert.show("追加失敗", response.message + " ,請洽客服人員。");
    }
  } catch (error) {
    console.error('追加金額錯誤:', error);
    await NewAlert.show("追加失敗", "請洽客服人員。");
  }
}

// 處理簽名合約 (status === 5)
async function handleSignCoreContract(transaction, plan) {
  const signUrl = coreFounderSignUrl.value

  if (!signUrl) {
   await NewAlert.show("系統錯誤", "簽署連結未設定，請聯繫管理員。")
    return
  }

  // 在新分頁中打開
  window.open(signUrl, '_blank')

  const formData = {
    participantPlanId: transaction.id,
    planId: plan.id,
    userId: currentUser.value,
  }

  const res = await userCheckApi.signCoreContractByUser(formData)
  if (res.code === 0) {
    await refreshAllData()
  } else {
    await NewAlert.show("操作失敗", res.message + ",請洽客服人員。")
  }
}

async function handleSignCoreContractSubmit(transaction, plan) {
  const formData = {
    participantPlanId: transaction.id,
    planId: plan.id,
    userId: currentUser.value,
  }

  const res = await userCheckApi.signCoreContractSubmitByUser(formData)
  if (res.code === 0) {
    await NewAlert.show("提交成功", "簽署完成提交成功")
    await refreshAllData()
  } else {
    await NewAlert.show("操作失敗", res.message + ",請洽客服人員。")
  }
}

// 處理支付服務費 (status === 11)
function handlePayServiceFee(transaction, plan) {
  selectedTransaction.value = transaction;
  selectedPlan.value = plan;

  // 設置支付表單
  paymentForm.participantPlanId = transaction.id;
  paymentForm.userId = currentUser.value;
  paymentForm.amount = transaction.amount * 0.05; // 5% 服務費
  paymentForm.accountLast5 = '';
  paymentForm.paymentProof = null;
  paymentForm.paymentProofName = '';

  // 清空錯誤
  paymentErrors.accountLast5 = '';
  paymentErrors.paymentProof = '';

  showPaymentDialog.value = true;
}

// 處理上傳成功事件
function handleUploadCorePlanFinalContract(transaction, plan) {
  selectedTransaction.value = transaction;
  selectedPlan.value = plan;

  showCorePlanFinalContractDialog.value = true;
}

// 文件上傳成功
function handleUploadSuccess(result) {
  const fileId = result.data?.id;
  const fileName = result.data?.displayName || result.data?.name;

  if (fileId) {
    paymentForm.paymentProof = fileId;
    paymentForm.paymentProofName = fileName;
    paymentErrors.paymentProof = '';
  }
}

// 驗證支付表單
function validatePaymentForm() {
  let isValid = true;

  if (!paymentForm.paymentProof) {
    paymentErrors.paymentProof = '請上傳付款憑證';
    isValid = false;
  }

  if (!paymentForm.accountLast5 || !/^\d{5}$/.test(paymentForm.accountLast5)) {
    paymentErrors.accountLast5 = '請輸入正確的5位數字';
    isValid = false;
  }

  return isValid;
}

// 提交支付資料
async function handlePaymentSubmit() {
  if (!validatePaymentForm()) {
    return;
  }

  try {
    const response = await userCheckApi.createCoreServiceChargeInfoByUser({
      participantPlanId: paymentForm.participantPlanId,
      userId: currentUser.value,
      accountLast5: paymentForm.accountLast5,
      amount: paymentForm.amount,
      paymentProof: paymentForm.paymentProof,
    });

    if (response.code === 0) {
      await NewAlert.show("上傳成功", "您的支付資料已成功上傳。");
      showPaymentDialog.value = false;
      await refreshAllData();
    } else {
      await NewAlert.show("上傳失敗", response.message + " ,請洽客服人員。");
    }
  } catch (error) {
    console.error('提交支付資料錯誤:', error);
    await NewAlert.show("上傳失敗", "請洽客服人員。");
  }
}

// 取消支付
function handlePaymentCancel() {
  showPaymentDialog.value = false;
  paymentForm.accountLast5 = '';
  paymentForm.paymentProof = null;
  paymentForm.paymentProofName = '';
}

// 金額輸入處理
function onAmountInput(plan) {
  // 只允許數字和小數點
  plan.increaseAmountStr = plan.increaseAmountStr.replace(/[^\d.]/g, '');
}

function onAmountBlur(plan) {
  // 格式化金額
  const amount = parseFloat(plan.increaseAmountStr);
  if (!isNaN(amount) && amount > 0) {
    plan.increaseAmountStr = amount.toString();
  } else {
    plan.increaseAmountStr = '';
  }
}

// ==================== 輔助函數 ====================

// 刷新所有數據
async function refreshAllData() {
  await Promise.all([
    getSystemSetting(),
    getAllParticipantPlanByUser(),
    getAllParticipantPlanDetailByUser(),
    getAllParticipantPlanRecordByUser(),
  ]);
}

// 同步模式
function syncModeFromRoute() {
  const byProp = props.entry === "brand";
  const byQuery = route.query.source === "brand";
  mode.value = byProp || byQuery ? "brand" : "account";

  if (typeof route.query.tab === "string") {
    activeTab.value = route.query.tab;
  } else {
    activeTab.value = props.preselectTab;
  }
}

// ==================== 生命週期 ====================

onMounted(async () => {
  syncModeFromRoute();

  if (mode.value === "account") {
    await refreshAllData();
  } else if (mode.value === "brand" && route.query.planId) {
    await getParticipantPlan();
  }
});

// 監聽路由變化
watch(
    () => [props.entry, route.query.source, route.query.tab],
    () => {
      syncModeFromRoute();
    }
);

const showCorePlanFinalContractDialog = ref(false)
const corePlanFinalContractFileName = ref('')
const corePlanFinalContractError = ref('')
async function handleCorePlanFinalContractSubmit() {
  if (!corePlanFinalContractFileName.value) {
    corePlanFinalContractError.value = '請上傳最終合約文件';
    return;
  }

  const formData = {
    participantPlanId: selectedTransaction.value.id,
    planId: selectedPlan.value.id,
    userId: currentUser.value,
    finalContractId: corePlanFinalContractFileName.value.id,
  }

  const res = await userCheckApi.uploadCorePlanFinalContractByUser(formData)
  if (res.code === 0) {
    await NewAlert.show("上傳成功", "最終合約文件已成功上傳。");
    showCorePlanFinalContractDialog.value = false
    corePlanFinalContractFileName.value = ''
    corePlanFinalContractError.value = ''
    await refreshAllData()
  } else {
    await NewAlert.show("上傳失敗", res.message + " ,請洽客服人員。");
  }
}

</script>

<style lang="scss" scoped>
.stack,
.details {
  display: flex;
  flex-flow: column;
  gap: 20px;
  width: 100%;
}

.article-card {
  width: 100%;
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

.details .article-card.expanded {
  padding: 30px;
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

  .time {
    color: $text-dark;
    font-size: $fs-14;
    font-weight: $fw-400;
    line-height: $lh-17;
  }

  .extend-text {
    color: #ff6634;
    font-size: $fs-14;
    font-weight: $fw-400;
    line-height: $lh-17;
  }
}

.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-weight: 400;
  font-size: $fs-14;
  line-height: 17px;
  width: 120px;
  text-align: center;

  &.pending-start {
    background: #dfdfdf;
    border: 1px solid #dfdfdf;
    color: #373a36;
  }

  &.applying {
    background: #ff9966;
    border: 1px solid #ff9966;
    color: #ffffff;
  }

  &.reviewing {
    border: 1px solid #ff6634;
    color: #ff6634;
    background: transparent;
  }

  &.review-failed {
    border: 1px solid #ff6634;
    color: #ff6634;
    background: transparent;
  }

  &.review-passed {
    border: 1px solid #ff6634;
    background: #ff6634;
    color: #fff;
  }

  &.running {
    border: 1px solid #45b665;
    color: #45b665;
    background: transparent;
  }


  &.match-success {
    border: 1px solid #45b665;
    background: #45b665;
    color: #fff;
  }

  &.joining {
    background: #ffc919;
    border: 1px solid #ffc919;
    color: #262626;
  }

  &.joined-success {
    border: 1px solid #555555;
    background: #555555;
    color: #fff;
  }

  &.match-failed {
    border: 1px solid #dfdfdf;
    background: #dfdfdf;
    color: #555555;
  }
}

.title {
  color: $text-deep;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
}

.content {
  font-weight: $fw-400;
  font-size: $fs-15;
  line-height: $lh-18;
  color: #373a36;
}

.progress-wrap {
  position: relative;
  background: #fff;
  margin-bottom: 2px;
}

.progress-bar {
  position: relative;
  height: 24px;
  background: #f2f2f2;
  border-radius: 999px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #ffb54a, #ff6634);
}

.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: $fw-500;
  font-size: $fs-14;
  line-height: $lh-17;
  color: $white;
}

.progress-label {
  position: absolute;
  top: -22px;
  right: 12px;
  font-size: 12px;
  color: $btn-orange;
  font-weight: 700;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  @media (max-width: 576px) {
    display: grid;
    gap: 5px;
  }
}

.remain {
  font-weight: $fw-500;
  font-size: $fs-15;
  line-height: $lh-22;
  color: $text-dark;
}

.dollar {
  font-weight: $fw-500;
  font-size: $fs-15;
  line-height: $lh-19;
  color: $btn-orange;
}

.details-dollar {
  font-weight: 500;
  font-size: $fs-15;
  line-height: 19px;
  color: #ff6634;
  gap: 30px;
}

.details-dollar-content {
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  text-align: right;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.fund-box {
  margin-top: 8px;
  display: grid;
  gap: 10px;
}

.fund-box .form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  @media (max-width: 576px) {
    display: contents;
  }

  &:first-child {
    grid-template-columns: 1fr;
  }
}

.label {
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  color: $text-dark;
}

.form-input {
  width: 100%;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid #e9ece8;
  font-size: $fs-14;
}

.btn {
  &-dollar {
    border: 0;
    padding: 10px 20px;
    border-radius: $br-8;
    background: $btn-orange;
    color: $white;
    cursor: pointer;
    width: 120px;
    font-weight: $fw-500;
    font-size: $fs-16;
    line-height: $lh-19;
  }

  &-prolong {
    border: 0;
    padding: 10px 20px;
    border-radius: $br-8;
    background: $btn-orange;
    color: $white;
    font-weight: $fw-500;
    font-size: $fs-16;
    line-height: $lh-19;
    width: 50%;
  }

  &-finish {
    border: 0;
    padding: 10px 20px;
    border-radius: $br-8;
    background: $brand-gray;
    color: $text-deep;
    font-weight: $fw-500;
    font-size: $fs-16;
    line-height: $lh-19;
    width: 50%;
  }
}

.file-list {
  margin-top: 6px;
  display: grid;
  gap: 8px;
}

.file-row {
  display: grid;
  padding: 10px 0;
  gap: 8px;
}

.file-content {
  display: inline-flex;
  justify-content: start;
  align-items: center;
  gap: 8px;
}

.file-title {
  font-weight: $fw-500;
  line-height: $lh-19;
}

.file-icon {
  width: 20px;
  height: 20px;
  border: none;
  background-color: transparent;
  padding: 0;
  display: inline-flex;
}

.file-name {
  color: $text-dark;
  font-weight: $fw-400;
  font-size: $fs-16;
  line-height: $lh-19;
}

.tx-list {
  gap: 10px;
  display: grid;
  @media (max-width: 576px) {
    gap: 20px;
  }

  .tx-row {
    display: flex;
    justify-content: space-between;
    color: #555555;
    @media (max-width: 576px) {
      display: grid;
      gap: 5px;
    }

    .tx-date {
      width: 17%;
      font-weight: 400;
      font-size: 16px;
      line-height: 140%;
      letter-spacing: 2px;
      @media (max-width: 576px) {
        width: 100%;
      }
    }

    .tx-btn {
      width: 35%;
      text-align: center;

      button {
        border-radius: 50px;
        border: none;
        background-color: #ff6634;
        color: #fff;
        padding: 0 15px;
      }
    }

    .tx-label {
      width: 25%;
      text-align: center;
      padding-right: 0.5rem;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      letter-spacing: 0.04em;
      @media (max-width: 576px) {
        width: 100%;
        text-align: start;
      }
    }

    .tx-status {
      text-align: end;
      width: 8%;
      color: $text-dark;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      letter-spacing: 0.04em;
      @media (max-width: 576px) {
        width: 100%;
        text-align: start;
      }
    }

    .tx-amount {
      width: 10%;
      text-align: end;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      @media (max-width: 576px) {
        width: 100%;
        text-align: start;
      }
    }
  }

  .is {
    &-pending {
      color: $brand-orange;
    }

    &-failed {
      color: $text-gray;
    }
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

.form-row {
  display: flex;
  gap: 10px;
}

.agree-row {
  justify-content: left !important;
}

.project-detail {
  display: grid;
  gap: 12px;
  font-size: 15px;
  color: #373a36;

  .detail-row {
    display: grid;
    gap: 10px;
    line-height: 1.6;

    .label {
      font-weight: 600;
      color: #555;
      min-width: 120px;
    }
  }
}

.progress-wrap {
  margin-top: 16px;
}

.progress-bar-container {
  width: 100%;
  margin-bottom: 8px;
}

.progress-bar-wrapper {
  position: relative;
  width: 100%;
  height: 32px;
  background-color: #f0f0f0;
  border-radius: 16px;
  overflow: hidden;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease, left 0.3s ease;

  &.completed {
    background: linear-gradient(90deg, #ff9a56 0%, #ff7b3d 100%);
    left: 0;
    z-index: 2;
  }

  &.pending {
    background: linear-gradient(90deg, #d0d0d0 0%, #b0b0b0 100%);
    z-index: 1;
  }

  .progress-text {
    color: white;
    font-size: 13px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  .dollar {
    color: #ff7b3d;
    font-weight: 600;
  }

  .remain {
    color: #666;
  }
}

</style>
