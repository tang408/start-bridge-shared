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
            <p class="title mb-2 mt-5">品牌資訊</p>
            <p class="subtitle mb-2 mt-3">詳細介紹</p>
            <!-- 使用資料庫的 brand_intro 欄位 -->
            <div v-if="projectData?.brandIntro" v-html="projectData.brandIntro"></div>
            <span v-else>暫無品牌介紹資料</span>

            <p class="subtitle">經營理念</p>
            <!-- 使用資料庫的 business_philosophy 欄位 -->
            <div v-if="projectData?.businessPhilosophy" v-html="projectData.businessPhilosophy"></div>
            <span v-else>暫無經營理念資料</span>
          </div>

          <div>
            <p class="title mb-2 mt-5">特色優勢</p>
            <!-- 使用資料庫的 advantages 欄位 -->
            <div v-if="projectData?.advantages" v-html="projectData.advantages"></div>
            <span v-else>暫無特色優勢資料</span>
          </div>

          <div>
            <p class="title mb-2 mt-5">營運項目(品項/單項)</p>
            <!-- 使用資料庫的 product_images 欄位 -->
            <div class="row g-3" v-if="productImages.length">
              <div class="col-md-4 col-12" v-for="(img, index) in productImages" :key="index">
                <img :src="img" class="w-100" style="border-radius: 30px;"/>
              </div>
            </div>
            <p v-else>暫無營運項目圖片</p>
          </div>

          <div>
            <p class="title mb-2 mt-5">當前規模(門店數/區域佔比)</p>
            <!-- 使用資料庫的 current_scale 欄位 -->
            <div v-if="projectData?.currentScale" v-html="projectData.currentScale"></div>
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
                <!-- 純文本值 -->
                <template v-if="row.value">{{ row.value }}</template>
                <!-- HTML 內容 -->
                <div v-else-if="row.html" class="html-content" v-html="row.html"></div>
                <!-- 列表內容 -->
                <ul v-else-if="row.list?.length" class="ji-list">
                  <li v-for="(li, j) in row.list" :key="j" v-html="li"></li>
                </ul>
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
                <!-- 純文本值 -->
                <template v-if="row.value">{{ row.value }}</template>
                <!-- HTML 內容 -->
                <div v-else-if="row.html" class="html-content" v-html="row.html"></div>
                <!-- 列表內容 -->
                <ul v-else-if="row.list?.length" class="ji-list">
                  <li v-for="(li, j) in row.list" :key="j" v-html="li"></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

// 點擊處理
function handleMatchingProjectClick() {
  if (!hasActivePlan.value) {
    return // 如果沒有活躍專案，不執行任何操作
  }

  if (firstPlanId.value) {
    // 跳轉到專案詳情頁（根據你的路由調整）
    router.push({
      name: 'ProjectDetail', // 或者你的路由名稱
      params: { id: firstPlanId.value }
    })
  }
}

// 處理營運項目圖片
const productImages = computed(() => {
  if (!props.projectData?.productImages) return [];

  try {
    // 如果是 JSON 字串，解析它
    return JSON.parse(props.projectData.productImages);
  } catch (error) {
    // 如果不是有效的 JSON，當作單一圖片處理
    return [props.projectData.productImages];
  }
});

// 動態生成加盟資訊數據 (保持原有邏輯，使用 extraFields)
const joinInfoData = computed(() => {
  if (!props.projectData) return [];

  const data = props.projectData;
  const extraFields = data.extraFields || {};

  return [
    {label: "加盟金", value: `${data.franchiseFee}萬元`},
    {label: "保證金", value: `${data.deposit}萬元`},
    {label: "加盟主門檻要求", html: `${data.threshold}`},
    {
      label: "開幕準備項目表列",
      list: extraFields.startup_projects?.map(item => `${item.displayName}：${item.value}`) || [],
    },
    {
      label: "加盟主門檻要求",
      list: extraFields.franchise_requirements?.map(item => `${item.displayName}：${item.value}`) || [],
    },
    {label: "目前開放加盟區域", value: data.location},
    {label: "店面條件", html: `${data.storeCondition}`},
    {
      label: "裝潢期程",
      list: extraFields.manufacturing_schedule?.map(item => `${item.displayName}：${item.value}天`) || [],
    },
    {
      label: "其他成本",
      list: extraFields.others?.map(item => `${item.displayName}：${item.value}`) || [],
    },
  ];
});

// 動態生成支援數據 (保持原有邏輯，使用 extraFields)
const supportData = computed(() => {
  if (!props.projectData) return [];

  const extraFields = props.projectData.extraFields || {};

  return [
    {
      label: "商業模式關鍵數據",
      list: extraFields.business_model?.map(item => `${item.displayName}：${item.value}`) || [],
    },
    {
      label: "加盟主培訓資訊",
      list: extraFields.franchise_training?.map(item => `${item.displayName}：${item.value}`) || [],
    },
    {
      label: "總部支援綱要",
      list: extraFields.support_services?.map(item => `${item.displayName}：${item.value}`) || [],
    },
  ];
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
      const userInfo = userData.value.userInfoData;

      if (
          founderInfo.city === 0 ||
          founderInfo.workStatus === "" ||
          founderInfo.expectIndustryType === 0 ||
          userInfo.lineId === ""
      ) {
        // ✅ 使用 favorite 模式彈窗
        const result = await NewAlert.favorite(
            "資料不齊全",
            "請完善會員資料(其他聯繫方式、所在的區域、工作狀態、預計加盟產業)後，再申請創業計畫，您可以選擇先收藏此計畫或前往完善資料"
        );

        if (result === 'favorite') {
          // 用戶選擇收藏
          await handleUserFavoritePlan();
          return;
        } else if (result === 'push') {
          // 用戶選擇前往完善資料
          await router.push({ path: "/account/profile" });
          return;
        }
        // result === false 表示用戶關閉彈窗，不做任何操作
        return;
      }
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
    await NewAlert.show("操作失敗", response.message + " ,無法將此品牌加入您的收藏，請洽客服人員");
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
  color: #262626;
}

.subtitle {
  font-weight: 700;
  font-size: 18px;
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

.tab-content {
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
  color: #555555;
}
</style>
