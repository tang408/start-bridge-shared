<template>
  <div class="fs-24">我的收藏</div>
  <div>
    <SharedTabs
        v-model="activeTab"
        :tabs="[
        { label: '專案', value: 1 },
        { label: '品牌', value: 2  },
      ]"
    />

    <div v-if="activeTab === 1" class="favorites-grid">
      <SharedCard
          v-for="c in creatorCards"
          :key="c.id"
          :card="c"
          mode="userFavorites"
          :showProgress="true"
          :showDownloadButton="true"
          :showInfo="true"
          @favorite-toggle="handleFavoriteToggle"
          @card-click="handlePlanClick"
          @download-plan="handlePDFPreviewClick(c)"
      />
    </div>

    <div v-if="activeTab === 2" class="favorites-grid">
      <SharedCard
          v-for="c in entCards"
          :key="c.id"
          :card="c"
          mode="userFavorites"
          :showProgress="false"
          :showInfo="false"
          :showBrandInfo="true"
          @favorite-toggle="handleFavoriteToggle"
          @card-click="handleBrandClick"
          @create-plan="handleCreatePlan(c)"
          @display-plan="handleMatchingPlansInfo(c)"
      />
    </div>
  </div>

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
                :class="{ expanded: expandedId === p.planId }"
            >
              <button
                  type="button"
                  class="summary"
                  @click="toggleParticipantPlan(p.planId)"
                  :aria-expanded="expandedId === p.planId ? 'true' : 'false'"
                  :aria-controls="`details-${p.planId}`"
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
                        :aria-valuenow="calculateProgress(p)"
                    >
                      <div
                          class="progress-inner"
                          :style="{ width: calculateProgress(p) + '%' }"
                      ></div>
                      <div class="progress-text">媒合進度 {{ calculateProgress(p) }}%</div>
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedCard from "@/components/shared/Shared-Card.vue";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";
import {useAuth} from "@/composables/useAuth.js";
import {NewAlert} from "@/composables/useAlert.js";
import {userApi} from "@/api/modules/user.js";
import {planApi} from "@/api/modules/plan.js";
import {useRouter} from "vue-router";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {isRunning, statusClass, statusLabel} from "@/utils/status.js";

const {isLoggedIn, currentUser} = useAuth();
const activeTab = ref(1);
const userFavoritePlans = ref(null);
const router = useRouter();

const creatorCards = computed(() => {
  if (!userFavoritePlans.value?.planFavoritePlans) return [];

  return userFavoritePlans.value.planFavoritePlans.map(plan => ({
    id: plan.planId,
    img: plan.planImage,
    title: plan.planName,
    progress: Math.round((plan.currentAmount / plan.targetAmount) * 100),
    price: `${plan.remainingDays}天`,
    supporters: `${plan.views}人關注`,
    favorite: true, // 在收藏頁面中預設為已收藏
    documentUrl: plan.documentUrl || "",
  }));
});

const entCards = computed(() => {
  if (!userFavoritePlans.value?.founderFavoritePlans) return [];

  return userFavoritePlans.value.founderFavoritePlans.map(partner => ({
    id: partner.officialPartnerId,
    img: partner.officialPartnerImage,
    title: partner.officialPartnerName,
    industryType: partner.industryType,
    franchiseFee: partner.franchiseFee,
    specialOffer: partner.specialOffer,
    favorite: true, // 在收藏頁面中預設為已收藏
  }));
});

// 處理收藏狀態切換
async function handleFavoriteToggle(newValue) {
  console.log(newValue)
  const formData = {
    userId: currentUser.value,
    planId: newValue.cardId, // 收藏時傳入 planId，取消收藏時傳 null
    planType: newValue.planType // 1: 專案, 2: 品牌
  };
  console.log(formData)
  const response = await userFavoritePlanApi.deleteUserFavoritePlan(formData)
  if (response.code !== 0) {
    await NewAlert.show("注意！", "操作失敗，請洽客服人員。");
    return;
  }
  // 重新獲取收藏列表
  await getUserFavoritePlans();
}

function handlePlanClick(card) {
  window.open(`/project/${card.id}`, '_blank');
}

function handleBrandClick(card) {
  window.open(`/cooperative-brand/${card.id}`, '_blank');
}

const userData = ref({})
async function handleCreatePlan(card) {
  if (!isLoggedIn.value) {
    await NewAlert.show("請先登入", "請先登入會員以繼續操作");
    await router.push({ path: "/login" });
    return;
  }

  const formData = {
    userId: currentUser.value,
  };

  const response = await userApi.getUserInfo(formData);

  if (response.code === 0) {
    userData.value = response.data;

    // 檢查創業者資料
    if (userData.value.founderInfoData) {
      const founderInfo = userData.value.founderInfoData;
      // const userInfo = userData.value.userInfoData;

      if (
          founderInfo.city === 0 ||
          founderInfo.workStatus === "" ||
          founderInfo.expectIndustryType === 0
          // userInfo.lineId === ""
      ) {
        // ✅ 使用 favorite 模式彈窗
        const result = await NewAlert.confirm(
            "資料不齊全",
            "請完善會員資料(所在的區域、工作狀態、預計加盟產業)後，再申請創業計畫，您可以選擇先收藏此計畫或前往完善資料"
        );

        if (result === 'confirm') {
          // 用戶選擇前往完善資料
          await router.push({
            path: "/account/profile",
            query: { tab: "founder"}
          });
          return;
        }
        // result === false 表示用戶關閉彈窗，不做任何操作
        return;
      }
    }

    // 檢查是否已有申請中的計畫
    const res = await planApi.checkCreatePlanStatus(formData);
    if (res.code === 0 && res.data.canCreatePlan === false) {
      await NewAlert.show("無法重複申請", "您已有一筆創業申請正在審核中，請勿重複申請");
      return;
    }
    // 所有檢查通過，跳轉到創業申請頁面
    await router.push({
      path: "/account/startup",
      query: {
        source: "business",
        step: "step1",
        brand: card.id
      },
    });
  }

  // 檢查是否已有申請中的計畫
  const res = await planApi.checkCreatePlanStatus(formData);
  if (res.code === 0 && res.data.canCreatePlan === false) {
    await NewAlert.show("無法重複申請", "您已有一筆創業申請正在審核中，請勿重複申請");
    return;
  }

  // 所有檢查通過，跳轉到創業申請頁面
  await router.push({
    path: "/account/startup",
    query: {
      source: "business",
      step: "step1",
      brand: props.projectData?.id || ""
    },
  });
}

async function handlePDFPreviewClick(plan) {
  if (plan.documentUrl !== "" && plan.documentUrl !== null) {
    window.open(plan.documentUrl, '_blank');
    return;
  }
  // 跳轉到獨立的 PDF 預覽頁面
  const routeData = router.resolve({
    name: 'StartupPDFPreview',
    params: { planId: plan.id }
  });

  window.open(routeData.href, '_blank');
}

const showPlanInfoDialog = ref(false);
const matchingPlansInfo = ref([])
function mapPlanStatus(currentStep) {
  if (currentStep === 9) return 'running';
  if (currentStep === 10) return 'running';
  if (currentStep === 11 || currentStep === 2) return 'match-failed';
  if (currentStep >= 12) return 'match-success';
  if (currentStep < 0) return 'match-failed';
  return 'pending-start';
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

async function handleMatchingPlansInfo(card) {
  const formData = {
    userId: currentUser.value,
    officialPartnerId: card.id,
  };
  const response = await planApi.getMatchingPlansInfo(formData);
  if (response.code === 0 && response.data !== null) {
    matchingPlansInfo.value = response.data.map((plan) => {
      const progress = plan.targetAmount > 0
          ? Math.min(Math.round((plan.totalParticipantAmount / plan.targetAmount) * 100), 100)
          : 0;

      const remain = Math.max(plan.targetAmount - plan.totalParticipantAmount, 0);
      const status = mapPlanStatus(plan.currentStep);

      return {
        // ✅ 使用與模板一致的欄位名稱
        planId: plan.planId,
        planName: plan.planName,
        planDescription: statusLabel(status), // 或使用實際的描述欄位
        status: status,
        remainingDays: calculateTimeRemaining(plan.endDate),
        currentAmount: plan.totalParticipantAmount,
        targetAmount: plan.targetAmount,
        progress: progress,

        // 額外資料（如果需要）
        endDate: plan.endDate,
        currentStep: plan.currentStep,
        totalParticipantUsers: plan.totalParticipantUsers,
      };
    });
  } else {
    matchingPlansInfo.value = [];
    console.error('獲取參與計畫失敗:', response.message);
  }
  showPlanInfoDialog.value = true;
}

function fmtMoney(amount) {
  if (amount === null || amount === undefined) return '$0';
  return amount.toLocaleString('zh-TW') + ' 元';
}

function calculateProgress(plan) {
  if (!plan.targetAmount || plan.targetAmount === 0) return 0;
  return Math.round((plan.currentAmount / plan.targetAmount) * 100);
}

const expandedId = ref(null);
async function toggleParticipantPlan(planId) {
  await router.push({
    path: "/account/participation",
    query: {
      source: "brand",
      tab: "progress",
      brandId: matchingPlansInfo.value.find(p => p.planId === planId)?.brandId || "",
      brandName: matchingPlansInfo.value.find(p => p.planId === planId)?.planName || "",
      planId: planId
    },
  });
}

async function getUserFavoritePlans() {
  if (!isLoggedIn.value) {
    return;
  }

  try {
    const formData = {
      userId: currentUser.value
    }
    const response = await userFavoritePlanApi.getUserFavoritePlans(formData);
    if (response.code === 0) {
      userFavoritePlans.value = response.data;
    }
  } catch (error) {
    console.error('獲取收藏列表失敗:', error);
  }
}

onMounted(() => {
  getUserFavoritePlans();
});

</script>

<style scoped lang="scss">
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // ⭐ 固定每行 3 個
  gap: 25px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr); // 平板顯示 2 個
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr; // 手機顯示 1 個
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden; // 🆕 防止水平溢出
  flex: 1;
  max-height: 600px;

  @media (max-width: 768px) {
    padding: 16px;
    max-height: 500px;
  }

  @media (max-width: 576px) {
    padding: 12px;
    max-height: 400px;
  }
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;

  p {
    margin: 0;
    font-size: 16px;
  }

  @media (max-width: 576px) {
    padding: 30px 16px;

    p {
      font-size: 14px;
    }
  }
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%; // 🆕 確保寬度為 100%

  @media (max-width: 576px) {
    gap: 12px;
  }
}

.article-card {
  width: 100%; // 🆕 確保卡片寬度為 100%
  max-width: 100%; // 🆕 防止超出容器
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  box-sizing: border-box; // 🆕 包含 border 在寬度內

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  @media (max-width: 576px) {
    border-radius: 8px;
  }
}

.summary {
  width: 100%; // 🆕 確保按鈕寬度為 100%
  max-width: 100%; // 🆕 防止超出容器
  padding: 20px 16px;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: background-color 0.2s;
  box-sizing: border-box; // 🆕 包含 padding 在寬度內

  &:hover {
    background-color: #f9fafb;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    line-height: 1.4;
    word-wrap: break-word; // 🆕 長文字換行
    word-break: break-word; // 🆕 強制換行
  }

  .content {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    word-wrap: break-word; // 🆕 長文字換行
  }

  @media (max-width: 576px) {
    padding: 16px 12px;
    gap: 12px;

    .title {
      font-size: 15px;
      line-height: 1.5;
    }

    .content {
      font-size: 13px;
    }
  }
}

.time {
  font-size: 12px;
  color: #ff6634;
  font-weight: 600;

  @media (max-width: 576px) {
    font-size: 11px;
  }
}

.gap-1 {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%; // 🆕 確保寬度為 100%

  @media (max-width: 576px) {
    gap: 6px;
  }
}

.progress-wrap {
  margin-top: 8px;
  width: 100%; // 🆕 確保寬度為 100%
  max-width: 100%; // 🆕 防止超出容器

  @media (max-width: 576px) {
    margin-top: 12px;
  }
}

.progress-bar {
  position: relative;
  width: 100%; // 🆕 確保寬度為 100%
  height: 28px;
  background-color: #f3f4f6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 576px) {
    height: 32px;
    border-radius: 16px;
  }
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #fb956d, #ff6634);
  transition: width 0.3s ease;
  border-radius: 20px;

  @media (max-width: 576px) {
    border-radius: 16px;
  }
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
  white-space: nowrap; // 🆕 防止文字換行

  @media (max-width: 576px) {
    font-size: 13px;
  }
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-top: 12px;
  padding: 0 4px;
  width: 100%; // 🆕 確保寬度為 100%
  box-sizing: border-box; // 🆕 包含 padding 在寬度內

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    font-size: 13px;
    margin-top: 10px;
    padding: 0 2px;
  }
}

.dollar {
  font-weight: 600;
  color: #059669;
  display: flex;
  align-items: center;
  gap: 4px;
  word-wrap: break-word; // 🆕 長數字換行

  @media (max-width: 576px) {
    font-size: 13px;
  }
}

.remain {
  color: #dc2626;
  font-weight: 500;
  word-wrap: break-word; // 🆕 長數字換行

  @media (max-width: 576px) {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .dialog-body {
    max-height: 500px;
  }

  .summary {
    padding: 16px 20px;
  }

  .progress-bar {
    height: 30px;
  }

  .progress-text {
    font-size: 13px;
  }
}
</style>
