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
        <a class="nav-link btn-yellow" role="button" @click="goToParticipation">
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

          <!-- 專案進度 -->
          <div class="project-progress-section">
            <h3 class="section-title">專案進度</h3>

            <!-- 進度條 -->
            <div class="progress-bar-container">
              <div class="progress-bar-wrapper">
                <div
                    class="progress-bar-fill"
                    :style="{
              width: `${props.planData?.planDetail.planProgress || 0}%`,
              backgroundColor: progressColor
            }"
                >
                  <span class="progress-text">{{ props.planData?.planDetail.planProgress || 0 }}%</span>
                </div>
              </div>
            </div>

            <!-- 進度數據 -->
            <div class="progress-stats">
              <div class="stat-card">
                <div class="stat-label">媒合總額</div>
                <div class="stat-value">
                  $ {{ formatAmount(props.planData?.planDetail.totalParticipantAmount || 0) }}
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-label">媒合人數</div>
                <div class="stat-value">
                  {{ props.planData?.planDetail.totalParticipants || 0 }} 人
                </div>
              </div>

              <div class="stat-card highlight">
                <div class="stat-label">還缺金額</div>
                <div class="stat-value">
                  $ {{ formatAmount(props.planData?.planDetail.remainingAmount || 0) }}
                </div>
              </div>

              <div class="stat-card highlight">
                <div class="stat-label">還缺人數</div>
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
                <!-- ✅ 使用 v-html 渲染 HTML 內容 -->
                <div v-if="row.value" v-html="row.value"></div>
                <ul v-else-if="row.list?.length" class="ji-list">
                  <li v-for="(li, j) in row.list" :key="j" v-html="li"></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="tabs-2-content d-flex-block justify-content-between mt-4">
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon1.png" class=""/>
              <span>免加盟金</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon2.png" class=""/>
              <span>含生財器具</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon3.png" class=""/>
              <span>含裝潢</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon4.png" class=""/>
              <span>含教育訓練</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon5.png" class=""/>
              <span>含廣告行銷</span>
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

        <div v-else-if="t.key === 'project'">
          <h1>報表內容</h1>
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
  {key: "joinInfo", label: "加盟資訊"},
  {key: "terms", label: "加盟條件"},
  {key: "project", label: "相關報表"},
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

  getIndustryTypeName();
});

const userData = ref({})

function formatAmount(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ✅ 進度條顏色（根據進度百分比）
const progressColor = computed(() => {
  const progress = props.planData?.planDetail.planProgress || 0;
  if (progress >= 100) return '#10b981'; // 綠色
  if (progress >= 50) return '#f59e0b';  // 橘色
  return '#ff6634';                      // 紅色
});

const handleViewBusinessPlan = async () => {
  // ✅ 檢查是否登入
  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以查看創業計劃書");
    await router.push({ path: "/login" });
    return;
  }

  // ✅ 檢查是否有計劃 ID
  if (!props.planData?.id) {
    await NewAlert.show("錯誤", "無法取得計劃書資訊");
    return;
  }

  // ✅ 開啟新視窗
  const url = `/account/startup?source=account&planId=${props.planData.id}&mode=pdf-preview`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

async function goToParticipation() {
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

    // ✅ 檢查用戶基本資料
    if (userData.value.userInfoData) {
      const userInfo = userData.value.userInfoData;

      if (!userInfo.lineId || userInfo.lineId === "") {
        const result = await NewAlert.favorite(
            "資料不齊全",
            "請先完善會員資料（其他聯繫方式）後，再申請創業計畫。您可以選擇先收藏此計畫或前往完善資料"
        );

        if (result === 'favorite') {
          await handleUserFavoritePlan();
          return;
        } else if (result === 'push') {
          await router.push({path: "/account/profile"});
          return;
        }
        return;
      }
    }

    // ✅ 檢查創業者資料（修正欄位名稱和判斷邏輯）
    if (userData.value.coreFounderData) {
      const coreFounderInfo = userData.value.coreFounderData;

      // ✅ 修正：移除字串檢查，只檢查數字和 0
      if (
          !coreFounderInfo.city ||
          coreFounderInfo.city === 0 ||
          !coreFounderInfo.workStatus ||
          coreFounderInfo.workStatus === "" ||
          !coreFounderInfo.minBudget ||
          coreFounderInfo.minBudget === 0 ||
          !coreFounderInfo.maxBudget ||
          coreFounderInfo.maxBudget === 0
      ) {
        const result = await NewAlert.favorite(
            "資料不齊全",
            "請完善會員資料（所在區域、工作狀態、最低、最高可投入資源、預計參與產業）後，再申請創業計畫。您可以選擇先收藏此計畫或前往完善資料"
        );

        if (result === 'favorite') {
          await handleUserFavoritePlan();
          return;
        } else if (result === 'push') {
          await router.push({path: "/account/profile"});
          return;
        }
        return;
      }
    }
  }

  // ✅ 所有檢查通過，跳轉到參與頁面
  await router.push({
    name: "participation",
    query: {
      source: "brand",
      tab: "progress",
      brandId: props.planData?.brand,
      brandName: props.brandData?.name,
      planId: props.planData?.id,
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
    planId: props.planData?.id,
    planType: 1
  }
  const response = await userFavoritePlanApi.createUserFavoritePlan(formData);
  if (response.code === 0) {
   await NewAlert.show("已收藏", "此計畫已成功加入您的收藏清單");
  } else {
    await NewAlert.show("收藏失敗", response.message + " ,加入收藏失敗，請洽客服人員");
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

// 動態生成加盟資訊數據 (保持原有邏輯，使用 extraFields)
const joinInfoData = computed(() => {
  if (!props.brandData) return [];

  const data = props.brandData;
  const extraFields = data.customFields || {};


  return [
    {label: "加盟金", value: `${data.franchiseFee}萬元`},
    {label: "保證金", value: `${data.deposit}萬元`},
    {label: "加盟主門檻要求", value: `${data.threshold}萬元`},
    {
      label: "開幕準備項目表列",
      list: extraFields.startup_projects?.map(item => `${item.fieldName}：${item.fieldValue}`) || [],
    },
    {
      label: "加盟主門檻要求",
      list: extraFields.franchise_requirements?.map(item => `${item.fieldName}：${item.fieldValue}`) || [],
    },
    {label: "目前開放加盟區域", value: data.location},
    {label: "店面條件", value: `${data.storeCondition}坪以上`},
    {
      label: "裝潢期程",
      list: extraFields.manufacturing_schedule?.map(item => `${item.fieldName}：${item.fieldValue}天`) || [],
    },
    {
      label: "其他成本",
      list: extraFields.others?.map(item => `${item.fieldName}：${item.fieldValue}`) || [],
    },
  ];
});

console.log(props.planData?.planDetail.brandIntro)
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
  }

  .ji-list {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 1em;

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }

  .ji-block + .ji-block {
    margin-top: 8px;
  }

  .ji-block-title {
    font-weight: 700;
    margin-bottom: 6px;
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
  transition: width 0.6s ease, background-color 0.3s ease;
  position: relative;
}

.progress-text {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
