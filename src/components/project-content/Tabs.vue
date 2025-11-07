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
          <ul class="row list-unstyled small text-body">
            <li class="col-12 col-md-6">
              <div class="title">公司成立狀態</div>
              <div v-if="props.brandData?.companyStatus" class="title-content">
                {{ getCompanyStatusName(props.brandData?.companyStatus) }} ({{ props.brandData.establishedDate }})
              </div>
              <div v-else class="title-content">
                已成立 (2022-06-15)
              </div>
            </li>
            <li class="col-12 col-md-6">
              <div class="title">公司網址</div>
              <div v-if="props.brandData?.website" class="title-content">
                {{ props.brandData?.website }}
                </div>
              <div v-else class="title-content">
                https://www.super-milk-tea.com/
              </div>
            </li>
            <li class="col-12 col-md-6">
              <div class="title">領域別</div>
              <div v-if="props.brandData?.industryType" class="title-content">
                {{ industryTypesData.find(item => item.id === props.brandData?.industryType)?.name || '未知' }}
              </div>
              <div v-else class="title-content">飲料店業</div>
            </li>
            <li class="col-12 col-md-6">
              <div class="title">FB粉絲團</div>
              <div v-if="props.brandData?.facebook" class="title-content">
                {{ props.brandData?.facebook }}
              </div>
              <div v-else class="title-content">
                https://www.facebook.com/super.milk.tea2022
              </div>
            </li>
            <li class="col-12">
              <div class="title">公司規模</div>
              <div class="title-content">暫不提供</div>
            </li>
            <li class="col-12">
              <div class="title">資本額</div>
              <div v-if="props.brandData?.capital" class="title-content">
                {{ props.brandData?.capital }}萬元
              </div>
              <div v-else class="title-content">100萬元 經濟部商業司查詢</div>
            </li>
          </ul>
          <p class="title">詳細介紹</p>

          <!-- ✅ 使用 v-html 渲染 HTML 內容 -->
          <div
              v-if="props.brandData?.description"
              class="mt-4 mb-4"
              v-html="props.brandData?.description"
          ></div>
          <p v-else class="mt-4 mb-4">
            於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。
            【一杯顏太煮 生活不會苦】。
          </p>


          <p class="title">經營理念</p>
          <div
              v-if="props.brandData?.businessConcept"
              class="mt-4 mb-4"
              v-html="props.brandData?.businessConcept"
          ></div>
          <p v-else class="">品牌核心 — 「以人為本，從心出發」</p>
          <p v-else class="">「堅持力」：堅持最好的服務、品質。</p>
          <p v-else class="">「專業力」：將每個最細微的地方做到最好</p>
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
              <img src="/src/assets/images/project-tabs-icon1.png" class="" />
              <span>免加盟金</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon2.png" class="" />
              <span>含生財器具</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon3.png" class="" />
              <span>含裝潢</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon4.png" class="" />
              <span>含教育訓練</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon5.png" class="" />
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
import { useRouter } from "vue-router";
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
  { key: "brand", label: "品牌資訊" },
  { key: "joinInfo", label: "加盟資訊" },
  { key: "terms", label: "加盟條件" },
  { key: "project", label: "相關報表" },
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

async function goToParticipation() {
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
          await router.push({ path: "/account/profile" });
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
          await router.push({ path: "/account/profile" });
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
    alert("請先登入會員");
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
    alert("已加入收藏");
  } else {
    alert(response.message || "操作失敗，請稍後再試");
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

const getCompanyStatusName = (status) => {
  const statuses = {
    1: "已設立",
    2: "籌備中",
    // 添加更多狀態映射
  };
  return statuses[status] || "未知";
};

// 動態生成加盟資訊數據 (保持原有邏輯，使用 extraFields)
const joinInfoData = computed(() => {
  if (!props.brandData) return [];

  const data = props.brandData;
  const extraFields = data.customFields || {};


  return [
    { label: "加盟金", value: `${data.franchiseFee}萬元` },
    { label: "保證金", value: `${data.deposit}萬元` },
    { label: "加盟主門檻要求", value: `${data.threshold}萬元` },
    {
      label: "開幕準備項目表列",
      list: extraFields.startup_projects?.map(item => `${item.fieldName}：${item.fieldValue}`) || [],
    },
    {
      label: "加盟主門檻要求",
      list: extraFields.franchise_requirements?.map(item => `${item.fieldName}：${item.fieldValue}`) || [],
    },
    { label: "目前開放加盟區域", value: data.location },
    { label: "店面條件", value: `${data.storeCondition}坪以上` },
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

</style>
