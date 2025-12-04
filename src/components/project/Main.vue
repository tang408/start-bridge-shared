<template>
  <div class="about-block">
    <div class="container">
      <div class="d-flex-block row">
        <div class="pic-content-1 col-md-6 col-12">
          <img src="@/assets/images/about-color-bc-1.png" class="w-100" />
          <img src="@/assets/images/about-pic1.png" class="pic-1" />
        </div>
        <div class="col-md-6 col-12">
          <h4 class="color-1 lh-24">我們相信創業不是一場單打獨鬥的冒險</h4>
          <span class="lh-36">
            讓每一個夢想背後，都有力量同行；讓每一筆投入，都創造可見的改變。<br />
            這是一個關於信任、共創、與價值對齊的平台
          </span>
          <img src="@/assets/images/about-sign.png" height="38" />
        </div>
      </div>
    </div>
    <img src="@/assets/images/shape-project-1.png" class="shape-project" />
  </div>
  <SharedFilter
    mode="progress"
    :items="items"
    :filters="filtersA"
    @update:order=handleOrderUpdate
    @update:category=handleCategoryUpdate
    @update:feature=handleFeatureUpdate
    @card-click="handleCardClick"
  />
  <div class="qa-content">
    <div class="qa-content-text">
      <h3>對專案有疑問?</h3>
      <span class="lh-26">
        創業路上，從品牌選擇、資金評估到市場定位，難免會有許多不確定性。我們擁有豐富的媒合與輔導經驗，承諾為您解答所有專案相關疑問，助您精準跨出創業第一步！
      </span>
      <button @click="goToQA">創業者QA</button>
    </div>
  </div>
</template>
<script setup>
import {computed, onMounted, ref} from "vue";
import { useRouter } from "vue-router";
import SharedFilter from "@/components/shared/Shared-Filter.vue";
import {planApi as PlanApi} from "@/api/modules/plan.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {useAuth} from "@/composables/useAuth.js";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";

const router = useRouter();
const {isLoggedIn, currentUser} = useAuth();

const items = ref([]);
const loading = ref(false);
const userFavorites = ref([]);

// 獲取用戶收藏狀態
async function getUserFavoritePlans() {
  if (!isLoggedIn.value) {
    userFavorites.value = [];
    return;
  }

  try {
    const formData = {
      userId: currentUser.value
    }
    const response = await userFavoritePlanApi.getUserFavoritePlans(formData);
    if (response.code === 0) {
      // 提取計劃收藏的 ID 列表
      userFavorites.value = response.data.planFavoritePlans.map(plan => plan.planId);
    }
  } catch (error) {
    console.error('獲取收藏狀態失敗:', error);
    userFavorites.value = [];
  }
}

// 將 API 資料轉換為組件需要的格式
function transformApiDataToItems(apiData) {
  return apiData.map(item => ({
    id: item.id,
    img: item.imageUrl || new URL("@/assets/images/card-box.png", import.meta.url).href,
    title: item.title,
    price: `${item.daysLeft}天`,
    supporters: `${item.views} 人瀏覽`,
    progress: Math.round(item.progress || 0),
    favorite: userFavorites.value.includes(item.id), // 檢查是否在收藏列表中
    expectedOpeningInfo: item.expectedOpeningInfo || '', // 預計開業區域
    to: { name: "ProjectDetail", params: { id: item.id } },
  }));
}

// 獲取所有計畫
async function getAllPlan(refreshFavorites = false) {
  try {
    loading.value = true;

    const formData = {
      daysLeftOrder: currentFilters.value.order || 0,
      industryType: currentFilters.value.industryType || 0,
      feature: currentFilters.value.feature || 0,
    };

    const promises = [await PlanApi.getAllPlan(formData)];

    // 只在需要時重新獲取收藏狀態
    if (refreshFavorites) {
      promises.push(getUserFavoritePlans());
    }

    const [planRes] = await Promise.all(promises);

    if (planRes && planRes.data) {
      const transformedData = transformApiDataToItems(planRes.data);
      items.value = transformedData;
    } else {
      items.value = [];
    }
  } catch (error) {
    console.error('獲取計畫資料失敗:', error);
    items.value = [];
  } finally {
    loading.value = false;
  }
}

const industryTypesData = ref([]);
async function getIndustryTypes() {
  const res = await industryTypeApi.getIndustryTypes();
  if (res && res.data) {
    industryTypesData.value = res.data;
  }
}

// 篩選器配置
const filtersA = computed(() => [
  {
    key: "order",
    placeholder: "依剩餘時間排列",
    showAny: false,
    options: [
      { value: 1, label: "剩餘時間（由少到多）" },
      { value: 2, label: "剩餘時間（由多到少）" },
    ],
  },
  {
    key: "category",
    placeholder: "選擇類別",
    anyLabel: "全部",
    options: industryTypesData.value.map(type => ({
      value: type.id,
      label: type.name
    })),
  },
  {
    key: "feature",
    placeholder: "缺創業夥伴",
    anyLabel: "不限",
    options: [
      { value: 1, label: "缺創業夥伴" },
      { value: 2, label: "有媒合進度" },
      { value: 3, label: "已結束" },
      { value: 4, label: "最新上架" },
    ],
  },
]);

// 當前篩選條件
const currentFilters = ref({
  industryType: 0,
  feature: 0,
  order: 0
});

// 統一的篩選更新函數
async function updateFilter(filterKey, value) {
  const filterValue = typeof value === 'object' ? value.value : value;
  currentFilters.value[filterKey] = filterValue || 0;

  // 篩選時不重新獲取收藏狀態
  await getAllPlan(false);
}

// 各個篩選器的處理函數
async function handleOrderUpdate(orderValue) {
  await updateFilter('order', orderValue);
}

async function handleCategoryUpdate(categoryValue) {
  await updateFilter('industryType', categoryValue);
}

async function handleFeatureUpdate(featureValue) {
  await updateFilter('feature', featureValue);
}

function handleCardClick(card) {
  if (card?.to) {
    router.push(card.to)
    return;
  }
}
const goToQA = () => {
  router.push({ path: "/activity", hash: "#qa" });
};

// 組件掛載時獲取初始資料
onMounted(async () => {
  await getIndustryTypes();
  await getUserFavoritePlans(); // 先獲取收藏狀態
  await getAllPlan(false); // 第一次載入時不需要重複獲取收藏狀態
});
</script>

<style lang="scss" scoped>
.about-block {
  position: relative;
  .d-flex-block {
    padding: 60px 0 190px;
    min-height: 510px;
    @media (max-width: 576px) {
      padding: 0;
    }
  }
  .pic-content-1 {
    position: relative;
    img {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      left: 50%;
    }
  }
  .col-md-6 {
    align-content: center;
    display: grid;
    padding: 0 1.5rem;
    gap: 10px;
    @media (max-width: 576px) {
      padding: 0;
      min-height: auto;
    }
    &.block-text {
      position: relative;
      @media (max-width: 576px) {
        display: flex;
        flex-flow: column;
        align-items: center;
      }
    }
  }
  .pic {
    &-1 {
      width: 82%;
      border-radius: 50px;
      left: 54% !important;
    }
    &-2 {
      top: 35% !important;
      left: 38% !important;
      width: 73%;
      border-radius: 50px;
    }
  }
  .shape-project {
    position: absolute;
    right: 15%;
    bottom: 5%;
    z-index: -1;
    @media (max-width: 576px) {
      right: 0;
      bottom: 0;
    }
  }
}

.qa-content {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    url("@/assets/images/project-qa.png");
  height: 550px;
  position: relative;
  &-text {
    width: 446px;
    padding: 40px;
    gap: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 30px;
    justify-content: center;
    display: flex;
    flex-flow: column;
    align-items: center;
    position: absolute;
    top: 150px;
    right: 200px;
    @media (max-width: 576px) {
      top: 50%;
      right: 50%;
      transform: translate(50%, -50%);
      width: 340px;
    }

    h3 {
      text-align: center;
      color: #373a36;
      font-weight: 600;
    }
    span {
      letter-spacing: 0.1em;
      color: #373a36;
    }
    button {
      padding: 10px 20px;
      background: #262626;
      border-radius: 50px;
      color: #fff;
      width: 250px;
      gap: 8px;
      display: flex;
      justify-content: center;
      border: none;
      letter-spacing: 2px;
      margin-top: 0.7rem;
    }
  }
}

.about-block {
  @media (max-width: 576px) {
    padding: 5rem 30px 0 30px;
  }
}

.filter-data {
  @media (max-width: 576px) {
    padding: 0 30px;
  }
}
</style>
