<template>
  <section class="company">
    <ul class="nav nav-pills gap-2" role="tablist">
      <li class="nav-item" role="presentation" v-for="t in tabs" :key="t.key">
        <button
            class="nav-link d-flex align-items-center gap-2"
            :class="{ active: t.key === activeTab }"
            :id="`tab-${t.key}`"
            data-bs-toggle="tab"
            :data-bs-target="`#panel-${t.key}`"
            type="button"
            role="tab"
            :aria-controls="`panel-${t.key}`"
            :aria-selected="t.key === activeTab ? 'true' : 'false'"
        >
          <img
              v-if="t.key === activeTab"
              src="@/assets/images/arrow-right.png"
              alt="active icon"
              class="tab-icon"
          />
          {{ t.label }}
        </button>
      </li>

      <li class="nav-item">
        <a
            class="nav-link btn-yellow"
            role="button"
            :class="{ 'disabled': !hasActivePlan }"
            :style="{
        cursor: hasActivePlan ? 'pointer' : 'not-allowed',
        opacity: hasActivePlan ? 1 : 0.5
        }"
            @click="handleMatchingProjectClick"
        >
          媒合中專案
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link btn-yellow" role="button" @click="goToStartup">
          申請創業
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link btn-yellow" role="button" @click="handleUserFavoritePlan">收藏</a>
      </li>
    </ul>

    <div class="tab-content mt-3">
      <div
          v-for="t in tabs"
          :key="`panel-${t.key}`"
          class="tab-pane fade"
          :class="{ 'show active': t.key === activeTab }"
          :id="`panel-${t.key}`"
          role="tabpanel"
          :aria-labelledby="`tab-${t.key}`"
      >
        <!-- 品牌資訊 Tab -->
        <template v-if="t.key === 'brand'">
          <div>
            <h2 class="title mb-2 mt-5">品牌資訊</h2>
            <h3 class="subtitle mb-2 mt-4">詳細介紹</h3>
            <div v-if="projectData?.brandIntro" class="ql-editor p-0" v-html="projectData.brandIntro"></div>
            <span v-else>暫無品牌介紹資料</span>

            <h3 class="subtitle mb-2 mt-4">經營理念</h3>
            <div v-if="projectData?.businessPhilosophy" class="ql-editor p-0" v-html="projectData.businessPhilosophy"></div>
            <span v-else>暫無經營理念資料</span>
          </div>

          <div>
            <h3 class="subtitle mb-2 mt-4">特色優勢</h3>
            <div v-if="projectData?.advantages" class="ql-editor p-0" v-html="projectData.advantages"></div>
            <span v-else>暫無特色優勢資料</span>
          </div>

          <div>
            <h3 class="subtitle mb-2 mt-4">產品圖片</h3>
            <div class="row g-3" v-if="productImages.length">
              <div class="col-md-4 col-12" v-for="(img, index) in productImages" :key="index">
                <img :src="img" class="w-100" style="border-radius: 30px;"/>
              </div>
            </div>
            <p v-else>暫無產品圖片</p>
          </div>

          <div>
            <h3 class="subtitle mb-2 mt-4">當前規模(門店數)</h3>
            <div v-if="projectData?.currentScale" class="ql-editor p-0" v-html="projectData.currentScale"></div>
            <div v-else>
              <span>暫無當前規模資料</span>
            </div>
          </div>
        </template>

        <!-- 加盟資訊 Tab -->
        <div v-else-if="t.key === 'joinInfo'">
          <div class="join-info">
            <div v-for="(row, i) in joinInfoData" :key="i" class="ji-row">
              <div class="ji-label">{{ row.label }}</div>
              <div class="ji-value">
                <template v-if="row.value">{{ row.value }}</template>
                <div v-else-if="row.html" class="html-content ql-editor p-0" v-html="row.html"></div>
                <span v-else class="text-muted">暫無資料</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 營運與支援 Tab -->
        <div v-else-if="t.key === 'support'">
          <div class="join-info">
            <div v-for="(row, i) in supportData" :key="i" class="ji-row">
              <div class="ji-label">{{ row.label }}</div>
              <div class="ji-value">
                <template v-if="row.value">{{ row.value }}</template>
                <div v-else-if="row.html" class="html-content ql-editor p-0" v-html="row.html"></div>
                <span v-else class="text-muted">暫無資料</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🆕 媒合中專案彈窗 -->
    <SharedModal
        v-model="showPlanInfoDialog"
        title="媒合中的創業計畫"
        mode="close"
        :width="600"
    >
      <div class="dialog-body">
        <section v-if="matchingPlansInfo && matchingPlansInfo.length > 0" class="details">
          <article
              v-for="p in matchingPlansInfo"
              :key="p.planId"
              class="article-card"
          >
            <button
                type="button"
                class="summary"
                @click="goToPlanDetail(p)"
            >
              <div class="gap-1 d-grid">
                <div class="title">{{ p.planName }}</div>
                <span class="time" v-if="isRunning(p.status)">
                  剩餘 {{ p.remainingDays }}天
                </span>
              </div>

              <div>
                <div class="progress-wrap" v-if="p.status !== 'applying' && p.currentAmount !== undefined">
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
                    <div class="progress-text">媒合進度 {{ p.progress }}%</div>
                  </div>

                  <div class="progress-footer mt-2">
                    <span class="dollar">已達成金額 {{ fmtMoney(p.currentAmount) }}</span>
                    <span class="remain">還差 {{ fmtMoney(p.targetAmount - p.currentAmount) }}</span>
                  </div>
                </div>
              </div>
            </button>
          </article>
        </section>

        <div v-else class="no-data">
          <p>目前沒有配對的創業計畫</p>
        </div>
      </div>
    </SharedModal>
  </section>
</template>

<script setup>
import {onMounted, ref, computed} from "vue";
import Tab from "bootstrap/js/dist/tab";
import {useRouter} from "vue-router";
import {useAuth} from "@/composables/useAuth.js";
import {userApi} from "@/api/modules/user.js";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";
import {planApi} from "@/api/modules/plan.js";
import {NewAlert} from "@/composables/useAlert.js";
import SharedModal from "@/components/shared/Shared-Modal.vue";

const {isLoggedIn, currentUser} = useAuth();
const router = useRouter();

const props = defineProps({
  projectData: {
    type: Object,
    default: () => null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 🆕 媒合中專案相關狀態
const showPlanInfoDialog = ref(false);
const matchingPlansInfo = ref([]);

// 判斷是否有活躍專案
const hasActivePlan = computed(() => {
  return props.projectData?.activePlanData?.hasActivePlan || false
})

// 獲取第一個專案 ID
const firstPlanId = computed(() => {
  const planData = props.projectData?.activePlanData?.planData
  if (planData && planData.length > 0) {
    return planData[0].id
  }
  return null
})

// 🆕 點擊媒合中專案按鈕
async function handleMatchingProjectClick() {
  if (!hasActivePlan.value) {
    return;
  }

  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以繼續操作");
    await router.push({path: "/login"});
    return;
  }

  // 獲取媒合中的計畫資訊
  await handleMatchingPlansInfo();
}

// 🆕 獲取媒合中計畫資訊
async function handleMatchingPlansInfo() {
  const formData = {
    userId: currentUser.value,
    officialPartnerId: props.projectData?.id,
  };

  const response = await planApi.getMatchingPlansInfo(formData);

  if (response.code === 0 && response.data !== null) {
    matchingPlansInfo.value = response.data.map((plan) => {
      const progress = plan.targetAmount > 0
          ? Math.min(Math.round((plan.totalParticipantAmount / plan.targetAmount) * 100), 100)
          : 0;

      const status = mapPlanStatus(plan.currentStep);

      return {
        planId: plan.planId,
        planName: plan.planName,
        planDescription: statusLabel(status),
        status: status,
        remainingDays: calculateTimeRemaining(plan.endDate),
        currentAmount: plan.totalParticipantAmount,
        targetAmount: plan.targetAmount,
        progress: progress,
        endDate: plan.endDate,
        currentStep: plan.currentStep,
        totalParticipantUsers: plan.totalParticipantUsers,
      };
    });
  } else {
    matchingPlansInfo.value = [];
  }

  showPlanInfoDialog.value = true;
}

// 🆕 跳轉到計畫詳情
function goToPlanDetail(plan) {
  router.push({
    name: 'ProjectDetail',
    params: {id: plan.planId}
  });
}

// 🆕 輔助函數：映射計畫狀態
function mapPlanStatus(currentStep) {
  const statusMap = {
    0: 'pending',
    1: 'applying',
    2: 'running',
    3: 'running',
    4: 'running',
    5: 'success',
    6: 'failed',
  };
  return statusMap[currentStep] || 'pending';
}

// 🆕 輔助函數：狀態標籤
function statusLabel(status) {
  const labels = {
    'pending': '審核中',
    'applying': '申請中',
    'running': '媒合中',
    'success': '媒合成功',
    'failed': '媒合失敗',
  };
  return labels[status] || '未知狀態';
}

// 🆕 輔助函數：計算剩餘天數
function calculateTimeRemaining(endDate) {
  if (!endDate) return 0;

  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

// 🆕 輔助函數：判斷是否進行中
function isRunning(status) {
  return status === 'running';
}

// 🆕 輔助函數：格式化金額
function fmtMoney(amount) {
  return amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
}

// 處理產品圖片
const productImages = computed(() => {
  if (!props.projectData?.productImages) return [];

  // 🆕 檢查是否為字串 "null"
  if (props.projectData.productImages === "null" || props.projectData.productImages === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(props.projectData.productImages);
    // 🆕 檢查解析後的結果
    if (!parsed || parsed === null) return [];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    // 如果不是有效的 JSON，檢查是否為有效字串
    if (typeof props.projectData.productImages === 'string' && props.projectData.productImages.trim()) {
      return [props.projectData.productImages];
    }
    return [];
  }
});

const formatAmount = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getCustomContent = (key) => {
  const customContents = props.projectData?.customContents || {};
  return customContents[key]?.content || '';
};

// 動態生成加盟資訊數據
const joinInfoData = computed(() => {
  if (!props.projectData) return [];

  const data = props.projectData;

  return [
    {
      label: "加盟金",
      value: `${formatAmount(data.franchiseFee)}元`
    },
    {
      label: "保證金",
      value: `${formatAmount(data.deposit)}元`
    },
    {
      label: "加盟主門檻要求",
      html: data.threshold
    },
    {
      label: "目前開放加盟區域",
      value: data.location
    },
    {
      label: "店面條件",
      html: data.storeCondition
    },
    {
      label: "加盟金涵蓋項目",
      html: getCustomContent('startup_projects')
    },
    {
      label: "裝潢期時程",
      html: getCustomContent('manufacturing_schedule')
    },
    {
      label: "其他成本",
      html: getCustomContent('others')
    },
  ].filter(item => item.value || item.html);
});

// 動態生成支援數據
const supportData = computed(() => {
  if (!props.projectData) return [];

  return [
    {
      label: "商業模式關鍵數據",
      html: getCustomContent('business_model')
    },
    {
      label: "加盟主培訓資訊",
      html: getCustomContent('franchise_training')
    },
    {
      label: "總部支援體系",
      html: getCustomContent('support_services')
    },
  ].filter(item => item.html);
});

const tabs = [
  {key: "brand", label: "品牌資訊"},
  {key: "joinInfo", label: "加盟資訊"},
  {key: "support", label: "營運與支援"},
];

const activeTab = ref(tabs[0].key);

onMounted(() => {
  const hash = window.location.hash.replace("#", "");
  if (tabs.some((t) => t.key === hash)) {
    activeTab.value = hash;
  }

  const triggerEl = document.querySelector(`#tab-${activeTab.value}`);
  if (triggerEl) new Tab(triggerEl).show();

  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((el) =>
      el.addEventListener("shown.bs.tab", (e) => {
        const id = e.target.id.replace("tab-", "");
        activeTab.value = id;
        history.replaceState(null, "", `#${id}`);
      })
  );
});

const userData = ref({})

async function goToStartup() {
  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以繼續操作");
    await router.push({path: "/login"});
    return;
  }

  const formData = {
    userId: currentUser.value,
  };

  const response = await userApi.getUserInfo(formData);

  if (response.code === 0) {
    userData.value = response.data;

    if (userData.value.founderInfoData) {
      const founderInfo = userData.value.founderInfoData;

      if (
          founderInfo.city === 0 ||
          founderInfo.workStatus === "" ||
          founderInfo.expectIndustryType === 0
      ) {
        const result = await NewAlert.favorite(
            "資料不齊全",
            "請完善會員資料(所在的區域、工作狀態、預計加盟產業)後，再申請創業計畫，您可以選擇先收藏此計畫或前往完善資料"
        );

        if (result === 'favorite') {
          await handleUserFavoritePlan();
          return;
        } else if (result === 'push') {
          await router.push({
            path: "/account/profile",
            query: {
              tab: "founder",
              returnTo: router.currentRoute.value.fullPath,
              brandId: props.projectData?.id
            }
          });
          return;
        }
        return;
      }
    }
  }

  const res = await planApi.checkCreatePlanStatus(formData);
  if (res.code === 0 && res.data.canCreatePlan === false) {
    await NewAlert.show("無法重複申請", "您已有一筆創業申請正在審核中，請勿重複申請");
    return;
  }

  await router.push({
    path: "/account/startup",
    query: {
      source: "business",
      step: "step1",
      brand: props.projectData?.id || ""
    },
  });
}

async function handleUserFavoritePlan() {
  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以繼續操作");
    await router.push({path: "/login"});
    return;
  }
  const formData = {
    userId: currentUser.value,
    planId: props.projectData?.id,
    planType: 2
  }
  const response = await userFavoritePlanApi.createUserFavoritePlan(formData);
  if (response.code === 0) {
    await NewAlert.show("操作成功", "已將此品牌加入您的收藏");
  } else {
    await NewAlert.show("注意", "此品牌已在您的收藏清單中");
  }
}
</script>

<style scoped lang="scss">
.nav-pills .nav-link {
  border: 2px solid #ff6634;
  color: #ff6634;
  font-weight: 700;
  border-radius: 50px;
  padding: 0.6rem 1rem;
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  width: 150px;
  justify-content: center;
}

.tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.nav-pills .nav-link.active {
  background: #ff6634;
  color: #fff;
}

.company {
  margin-bottom: 3rem;

  .tab-pane {
    padding: 3rem;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    border-radius: 20px;
    @media (max-width: 576px) {
      padding: 25px;
    }
  }
}

.btn-yellow {
  background: #ffcc00 !important;
  border: 2px solid #ffcc00 !important;
  color: #000 !important;
  font-weight: 700;
  border-radius: 50px;
  padding: 0.6rem 1rem;
  display: inline-flex;
  align-items: center;
}

.title {
  font-weight: 600;
  font-size: 18px;
  line-height: 26px;
  color: #ff6634;
}

.subtitle {
  font-weight: 700;
  font-size: 16px;
  line-height: 28px;
  color: #555555;
  margin-top: 3rem;
}

span {
  color: #555555;
}

.join-info {
  .ji-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 16px;
    padding: 14px 0;

    &:last-child {
      border-bottom: 0;
    }
  }

  .ji-label {
    font-weight: 600;
    font-size: 16px;
    line-height: 28px;
    color: #373a36;
    word-break: keep-all;
  }

  .ji-value {
    font-weight: 400;
    font-size: 16px;
    line-height: 28px;
    color: #555555;

    .text-muted {
      color: #999 !important;
      font-style: italic;
    }
  }

  .html-content {
    :deep(p) {
      margin: 0;
      padding: 0;
    }

    :deep(strong) {
      font-weight: 700;
    }
  }

  @media (max-width: 576px) {
    .ji-row {
      grid-template-columns: 1fr;
      gap: 6px;

      .ji-label {
        color: #555;
      }
    }
  }
}

.tab-content {
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
  color: #555555;
}

// 🆕 媒合中專案彈窗樣式
.dialog-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  max-height: 600px;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;

  p {
    margin: 0;
    font-size: 16px;
  }
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }
}

.summary {
  width: 100%;
  padding: 20px 16px;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    line-height: 1.4;
  }

  .content {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
  }
}

.time {
  font-size: 12px;
  color: #ff6634;
  font-weight: 600;
}

.gap-1 {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-wrap {
  margin-top: 8px;
}

.progress-bar {
  position: relative;
  height: 28px;
  background-color: #f3f4f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #fb956d, #ff6634);
  transition: width 0.3s ease;
  border-radius: 20px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-top: 12px;
  padding: 0 4px;
}

.dollar {
  font-weight: 600;
  color: #059669;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remain {
  color: #dc2626;
  font-weight: 500;
}

@media (max-width: 768px) {
  .dialog-body {
    max-height: 500px;
  }

  .summary {
    padding: 16px 20px;
  }

  .progress-bar {
    height: 36px;
  }

  .progress-text {
    font-size: 14px;
  }

  .progress-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
