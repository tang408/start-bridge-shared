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
        Lorem ipsum is placeholder text commonly used in the graphic, print, and
        publishing industries for previewing
      </span>
      <button>創業者QA</button>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import { useRouter } from "vue-router";
import SharedFilter from "@/components/shared/Shared-Filter.vue";
import {planApi as PlanApi} from "@/api/modules/plan.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
const router = useRouter();
const items = ref([]);
// const items = ref([
//   {
//     id: 1,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 76,
//     to: { name: "ProjectDetail", params: { id: 1 } },
//   },
//   {
//     id: 2,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 54,
//     to: { name: "ProjectDetail", params: { id: 2 } },
//   },
//   {
//     id: 3,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 32,
//     to: { name: "ProjectDetail", params: { id: 3 } },
//   },
//   {
//     id: 4,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 88,
//     to: { name: "ProjectDetail", params: { id: 4 } },
//   },
//   {
//     id: 5,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 45,
//     to: { name: "ProjectDetail", params: { id: 5 } },
//   },
//   {
//     id: 6,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 20,
//     to: { name: "ProjectDetail", params: { id: 6 } },
//   },
//   {
//     id: 7,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 65,
//     to: { name: "ProjectDetail", params: { id: 7 } },
//   },
//   {
//     id: 8,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 100,
//     to: { name: "ProjectDetail", params: { id: 8 } },
//   },
//   {
//     id: 9,
//     img: new URL("@/assets/images/card-box.png", import.meta.url).href,
//     title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
//     price: "99天",
//     supporters: "9999 人瀏覽",
//     progress: 12,
//     to: { name: "ProjectDetail", params: { id: 9 } },
//   },
// ]);

// 載入狀態
const loading = ref(false);


// 處理卡片點擊
function handleCardClick(card) {
  if (card.to) {
    console.log('導航到:', card.to)
    router.push(card.to);
  }
}

// 處理篩選器變更 - 每次變更都重新發送 API 請求
async function handleOrderUpdate(orderValue) {
  currentFilters.value.order = orderValue;

  // 重新獲取資料，然後排序
  await getAllPlan();
}

async function handleCategoryUpdate(categoryValue) {
  const industryType = typeof categoryValue === 'object' ? categoryValue.value : categoryValue;
  currentFilters.value.industryType = industryType || 0;

  // 立即發送 API 請求
  await getAllPlan();
}

async function handleFeatureUpdate(featureValue) {
  const feature = typeof featureValue === 'object' ? featureValue.value : featureValue;
  currentFilters.value.feature = feature || 0;

  // 立即發送 API 請求
  await getAllPlan();
}


// 將 API 資料轉換為組件需要的格式
function transformApiDataToItems(apiData) {
  return apiData.map(item => ({
    id: item.id,
    img: item.imageUrl || new URL("@/assets/images/card-box.png", import.meta.url).href,
    title: item.title,
    price: `${item.daysLeft}天`, // 剩餘天數
    supporters: `${item.views} 人瀏覽`, // 瀏覽數
    progress: Math.round(item.progress || 0), // 進度百分比，四捨五入
    to: { name: "ProjectDetail", params: { id: item.id } }, // 路由
  }));
}

// 獲取所有計畫
async function getAllPlan() {
  try {
    // 顯示載入狀態
    loading.value = true;

    const formData = {
      daysLeftOrder: currentFilters.value.order || 0,
      industryType: currentFilters.value.industryType || 0,
      feature: currentFilters.value.feature || 0,
    };

    const res = await PlanApi.getAllPlan(formData);
    if (res && res.data) {
      // 轉換 API 資料格式
      const transformedData = transformApiDataToItems(res.data);
      items.value = transformedData;
    } else {
      items.value = [];
    }
  } catch (error) {
    console.error('獲取計畫資料失敗:', error);
    // 錯誤處理：設為空陣列
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
      { value: 2, label: "有募資進度" },
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

// 組件掛載時獲取初始資料
onMounted(async () => {
  await getIndustryTypes();
  await getAllPlan();
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
