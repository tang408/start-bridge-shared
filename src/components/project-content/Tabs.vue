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
            @click="goToParticipation"
            :class="{ 'disabled': !canParticipate }"
            :style="{ cursor: canParticipate ? 'pointer' : 'not-allowed', opacity: canParticipate ? 1 : 0.6 }"
        >
          參與專案
        </a>
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
        <template v-if="t.key === 'brand'">
          <!-- 品牌名稱 -->
          <div class="brand-header">
            <h2 class="brand-name">{{ props.planData?.planDetail.brandName || '品牌名稱' }}</h2>
          </div>

          <!-- 品牌介紹 -->
          <div class="brand-intro-section">
            <h3 class="section-title">品牌介紹</h3>
            <div
                v-if="props.planData?.planDetail.brandIntro"
                class="brand-intro-content"
                v-html="props.planData?.planDetail.brandIntro"
            ></div>
            <p v-else class="text-muted">暫無品牌介紹</p>
          </div>
          <div class="brand-intro-section">
            <h3 class="section-title">預計開業區域/坪數/店面狀況：</h3>
            <div
                v-if="props.planData?.expectedOpeningInfo"
                class="brand-intro-content"
            >{{ props.planData?.expectedOpeningInfo}}</div>
            <p v-else class="text-muted">未提供</p>
          </div>
          <div class="brand-intro-section">
            <h3 class="section-title">預計開業時間：</h3>
            <div
                v-if="props.planData?.expectedOpeningDate"
                class="brand-intro-content"
            >{{ props.planData?.expectedOpeningDate}}</div>
            <p v-else class="text-muted">未提供</p>
          </div>

          <!-- 專案進度 -->
          <div class="project-progress-section">
            <h3 class="section-title">專案進度</h3>

            <!-- 🆕 雙層進度條：橘色（已完成）+ 灰色（審核中）-->
            <div class="progress-bar-container">
              <div class="progress-bar-wrapper">
                <!-- 橘色進度條（已完成）-->
                <div
                    class="progress-bar-fill completed"
                    :style="{ width: `${completedProgress}%` }"
                >
                  <span class="progress-text" v-if="completedProgress > 5">
                    {{ completedProgress }}%
                  </span>
                </div>

                <!-- 灰色進度條（審核中）-->
                <div
                    class="progress-bar-fill pending"
                    :style="{
                      width: `${pendingProgress}%`,
                      left: `${completedProgress}%`
                    }"
                >
                  <span class="progress-text" v-if="pendingProgress > 5">
                    {{ pendingProgress }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- 進度數據 -->
            <div class="progress-stats">
              <div class="stat-card">
                <div class="stat-label">已完成媒合總額</div>
                <div class="stat-value completed-color">
                  $ {{ formatAmount(props.planData?.planDetail.completedAmount || 0) }}
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-label">已媒合人數</div>
                <div class="stat-value">
                  {{ props.planData?.planDetail.totalUniqueParticipants || 0 }} 人
                </div>
              </div>

              <div class="stat-card highlight">
                <div class="stat-label">尚缺金額</div>
                <div class="stat-value">
                  $ {{ formatAmount(props.planData?.planDetail.remainingAmount || 0) }}
                </div>
              </div>

              <div class="stat-card highlight">
                <div class="stat-label">尚缺人數</div>
                <div class="stat-value">
                  {{ props.planData?.planDetail.remainingParticipants || 0 }} 人
                </div>
              </div>
            </div>
          </div>

          <!-- 創業者介紹 -->
          <div class="founder-section">
            <h3 class="section-title">創業者介紹</h3>
            <div class="founder-intro">
              <p v-if="props.planData?.planDetail.founderIntro">
                {{ props.planData?.planDetail.founderIntro }}
              </p>
              <p v-else class="text-muted">暫無創業者介紹</p>
            </div>
          </div>

          <!-- 創業計劃書跳轉 -->
          <div class="founder-section mt-4">
            <h3 class="section-title">創業計劃書</h3>
            <div class="founder-intro">
              <a
                  href="#"
                  @click.prevent="handleViewBusinessPlan"
                  class="business-plan-link"
              >
                點此查看創業計劃書
              </a>
            </div>
          </div>

        </template>

        <div v-else-if="t.key === 'joinInfo'">
          <div class="join-info">
            <div v-for="(row, i) in joinInfoData" :key="i" class="ji-row">
              <div class="ji-label">{{ row.label }}</div>
              <div class="ji-value">
                <!-- 純文本值 -->
                <template v-if="row.value">{{ row.value }}</template>
                <!-- HTML 內容 -->
                <div v-else-if="row.html" class="html-content" v-html="row.html"></div>
                <!-- 空值提示 -->
                <span v-else class="text-muted">暫無資料</span>
              </div>
            </div>
          </div>
        </div>



        <div v-else-if="t.key === 'terms'" class="d-flex-block">
          <!-- 檢查 franchiseInfo 是否存在 -->
          <template v-if="planData?.franchiseInfo">
            <div class="franchise-section">
              <!-- 顯示 info（HTML 內容）-->
              <div
                  v-if="planData.franchiseInfo.info"
                  class="franchise-info-content"
                  v-html="planData.franchiseInfo.info"
              ></div>

              <!-- 顯示 images（直接遍歷陣列）-->
              <div v-if="planData.franchiseInfo.images?.length">
                <h4 class="images-title">相關圖片</h4>
                <div class="franchise-images">
                  <img
                      v-for="(image, index) in planData.franchiseInfo.images"
                      :key="index"
                      :src="image"
                      :alt="`加盟圖片 ${index + 1}`"
                      class="franchise-image"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- 沒有資料時顯示 -->
          <div v-else class="no-franchise-info">
            <p>暫無加盟條件資訊</p>
          </div>
        </div>

        <div v-else-if="t.key === 'project'" class="d-flex-block">
          <!-- 檢查 franchiseInfo 是否存在 -->
          <template v-if="planData?.reportInfo">
            <div class="franchise-section">
              <!-- 顯示 info（HTML 內容）-->
              <div
                  v-if="planData.reportInfo.info"
                  class="franchise-info-content"
                  v-html="planData.reportInfo.info"
              ></div>

              <!-- 顯示 images（直接遍歷陣列）-->
              <div v-if="planData.reportInfo.images?.length">
                <h4 class="images-title">相關圖片</h4>
                <div class="franchise-images">
                  <img
                      v-for="(image, index) in planData.reportInfo.images"
                      :key="index"
                      :src="image"
                      :alt="`加盟圖片 ${index + 1}`"
                      class="franchise-image"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- 沒有資料時顯示 -->
          <div v-else class="no-franchise-info">
            <p>暫無相關報表資訊</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import Tab from "bootstrap/js/dist/tab";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {NewAlert} from "@/composables/useAlert.js";
import {userApi} from "@/api/modules/user.js";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";
import {useAuth} from "@/composables/useAuth.js";

const {isLoggedIn, currentUser} = useAuth();

const props = defineProps({
  brandData: {
    type: Object,
    required: true,
  },
  planData: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const tabs = [
  {key: "brand", label: "專案詳情"},
  {key: "joinInfo", label: "加盟條件"},
  {key: "terms", label: "加盟資訊"},
  {key: "project", label: "相關報表"},
];

const activeTab = ref(tabs[0].key);

// 🆕 計算屬性：橘色進度（已完成）
const completedProgress = computed(() => {
  return props.planData?.planDetail?.completedProgress || 0;
});

// 🆕 計算屬性：灰色進度（審核中）
const pendingProgress = computed(() => {
  return props.planData?.planDetail?.pendingProgress || 0;
});

// 🆕 計算屬性：總進度
const totalProgress = computed(() => {
  return props.planData?.planDetail?.totalProgress || 0;
});

// 🆕 計算屬性：審核中金額
const pendingAmount = computed(() => {
  return props.planData?.planDetail?.pendingAmount || 0;
});

// 🆕 計算屬性：是否可參與
const canParticipate = computed(() => {
  const currentStep = props.planData?.currentStep;
  const endTime = props.planData?.endTime; // "2025-12-10"
  const canParticipateFlag = props.planData?.planDetail?.canParticipate ?? true;

  // 獲取今天的日期字串 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  console.log('endDate:', endTime);
  console.log('today:', today);
  console.log('比較結果:', endTime >= today);

  return canParticipateFlag &&
      currentStep > 0 &&
      currentStep !== 2 &&
      currentStep !== 11 &&
      endTime &&
      endTime >= today; // 包含當天
});

// 🆕 計算屬性：最大可投資金額
const maxParticipateAmount = computed(() => {
  return props.planData?.planDetail?.maxParticipateAmount || 0;
});

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

  getIndustryTypeName();
});

const userData = ref({})

function formatAmount(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function goToParticipation() {
  // 🆕 檢查是否可以參與
  if (!canParticipate.value) {
    await NewAlert.show("無法參與", "目前專案已額滿或審核中，暫時無法參與");
    return;
  }

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

    // 檢查創業者資料
    if (userData.value.coreFounderData) {
      const coreFounderInfo = userData.value.coreFounderData;

      if (
          !coreFounderInfo.city ||
          coreFounderInfo.city === 0 ||
          !coreFounderInfo.workStatus ||
          coreFounderInfo.workStatus === "" ||
          !coreFounderInfo.maxBudget ||
          coreFounderInfo.maxBudget === 0
      ) {
        const result = await NewAlert.favorite(
            "資料不齊全",
            "請完善會員資料（所在區域、工作狀態、最高可投入資源、預計參與產業）後，再參與專案。您可以選擇先收藏此計畫或前往完善資料"
        );

        if (result === 'favorite') {
          await handleUserFavoritePlan();
          return;
        } else if (result === 'push') {
          await router.push({
            path: "/account/profile",
            query: { tab: "cofounder"}
          });
          return;
        }
        return;
      }
    }
  }

  // 所有檢查通過，跳轉到參與頁面
  await router.push({
    name: "participation",
    query: {
      source: "brand",
      tab: "progress",
      brandId: props.planData?.brand,
      brandName: props.brandData?.name,
      planId: props.planData?.id,
      maxAmount: maxParticipateAmount.value, // 🆕 傳遞最大可投資金額
    },
  });
}

// ... 其他函數保持不變 ...

const handleViewBusinessPlan = async () => {
  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以查看創業計劃書");
    await router.push({path: "/login"});
    return;
  }

  if (!props.planData?.id) {
    await NewAlert.show("錯誤", "無法取得計劃書資訊");
    return;
  }

  if (props.planData.documentUrl != null && props.planData.documentUrl !== '' ) {
    window.open(props.planData.documentUrl, '_blank');
    return;
  }

  const routeData = router.resolve({
    name: 'StartupPDFPreview',
    params: {planId: props.planData.id}
  });

  window.open(routeData.href, '_blank');
};

async function handleUserFavoritePlan() {
  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以繼續操作");
    await router.push({path: "/login"});
    return;
  }
  const formData = {
    userId: currentUser.value,
    planId: props.planData?.id,
    planType: 1
  }
  const response = await userFavoritePlanApi.createUserFavoritePlan(formData);
  if (response.code === 0) {
    await NewAlert.show("已收藏", "此計畫已成功加入您的收藏清單");
  } else {
    await NewAlert.show("已收藏", "此計畫已在您的收藏清單中");
  }
}

const industryTypesData = ref([]);

async function getIndustryTypeName() {
  try {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
      industryTypesData.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取行業類型失敗:', error);
    return "未知";
  }
}

const getCustomContent = (key) => {
  const customContents = props.brandData?.customContents || {};
  return customContents[key]?.content || '';
};

const joinInfoData = computed(() => {
  if (!props.brandData) return [];

  const data = props.brandData;

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

</script>

<style scoped lang="scss">
.franchise-info-content {
  margin-bottom: 30px;
  line-height: 1.8;
  color: #373a36;

  :deep(h1), :deep(h2), :deep(h3) {
    margin: 20px 0 10px;
    color: #373a36;
  }

  :deep(p) {
    margin: 10px 0;
    color: #555;
  }

  :deep(ul), :deep(ol) {
    margin: 12px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin: 6px 0;
  }
}

.franchise-images {
  display: flex;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.franchise-image {
  display: flex;
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: transform 0.3s;

}

.no-franchise-info {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 16px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;

  .el-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .franchise-images {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .franchise-image {
    height: 150px;
  }
}

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

.list-unstyled {
  gap: 10px 0;
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
}

.col-12 {
  display: flex;
}

.title {
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
  width: 120px;

  &-content {
    width: calc(100% - 120px);
    overflow-wrap: break-word;
  }
}

.tabs-2-content {
  .col-2 {
    background: rgba(237, 237, 237, 0.8);
    color: #373a36;
    border-radius: 30px;
    height: 184px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;

    img {
      margin-bottom: 0.5rem;
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
      margin: 0 0 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(ul), :deep(ol) {
      margin: 0;
      padding-left: 1.5em;
    }

    :deep(li) {
      margin: 4px 0;
    }

    :deep(strong) {
      font-weight: 700;
      color: #373a36;
    }

    :deep(em) {
      font-style: italic;
    }

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin: 12px 0 8px 0;
      color: #373a36;
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

/* ========== 品牌標題 ========== */
.brand-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ff6634;
}

.brand-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* ========== 區塊標題 ========== */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  padding-left: 0.75rem;
  border-left: 4px solid #ff6634;
}

/* ========== 品牌介紹 ========== */
.brand-intro-section {
  margin-bottom: 2rem;
}

.brand-intro-content {
  line-height: 1.8;
  color: #555;
}

.brand-intro-content :deep(p) {
  margin-bottom: 0.75rem;
}

.brand-intro-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* ========== 專案進度 ========== */
.project-progress-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 進度條 */
.progress-bar-container {
  margin-bottom: 1.5rem;
}

/* 🆕 雙層進度條樣式 */
.progress-bar-wrapper {
  width: 100%;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.6s ease;
  position: absolute;
  top: 0;
}

.progress-bar-fill.completed {
  background-color: #ff6634; /* 橘色 */
  left: 0;
  z-index: 2;
}

.progress-bar-fill.pending {
  background-color: #d1d5db; /* 灰色 */
  z-index: 1;
}

.progress-text {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 🆕 總進度文字 */
.total-progress-text {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.pending-hint {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
}

/* 🆕 金額顏色 */
.completed-color {
  color: #ff6634 !important;
}

.pending-color {
  color: #6b7280 !important;
}

/* 🆕 禁用按鈕樣式 */
.btn-yellow.disabled {
  pointer-events: none;
  background: #e5e7eb !important;
  border-color: #e5e7eb !important;
  color: #9ca3af !important;
}

/* 進度數據卡片 */
.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card.highlight {
  border: 2px solid #ff6634;
  background: #fff5f2;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff6634;
}

.stat-card.highlight .stat-value {
  font-size: 1.5rem;
}

/* ========== 創業者介紹 ========== */
.founder-section {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.founder-intro {
  line-height: 1.8;
  color: #555;
}

.founder-intro p {
  margin: 0;
}

.text-muted {
  color: #999;
  font-style: italic;
}

/* ========== 響應式設計 ========== */
@media (max-width: 768px) {
  .brand-name {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .progress-bar-wrapper {
    height: 32px;
  }

  .progress-text {
    font-size: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .stat-card.highlight .stat-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .progress-stats {
    grid-template-columns: 1fr;
  }
}

</style>
