<template>
  <div v-if="loading" class="loading-container">
    <div class="spinner">載入中...</div>
  </div>
  <div v-else class="project-content">
    <div class="container">
      <div class="row pt-5 pb-5 g-4">
        <div class="col-md-4">
          <img :src="projectData?.photo || '@/assets/images/project-content-img-1.png'" class="w-100" />
        </div>

        <div class="col-md-8 introduction">
          <h1>{{ projectData?.name || '顏太煮奶茶' }}</h1>
          <!-- 使用 v-html 渲染 HTML 內容 -->
          <div v-if="projectData?.description" v-html="projectData.description"></div>
          <p v-else>
            於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。<br />
            【一杯顏太煮 生活不會苦】。
            為持續提升市場競爭力，不斷地研發新品與尋找高品質原物料，從中累積的務實經驗，以成熟技術打造特色連鎖奶茶店，拓展業務從加盟業務到開店技術指導，用不斷累積的know-how，造就全方位品牌力。
          </p>
          <div class="content row">
            <div class="col-md-6" v-for="(it, i) in detailItems" :key="i">
              <div class="row g-2 align-items-start w-100">
                <div class="col-md-4">{{ it.label }}</div>
                <div class="col-md-8">
                  <template v-if="it.type === 'link'">
                    <a
                        :href="it.value"
                        target="_blank"
                        rel="noopener noreferrer"
                    >{{ it.value }}</a
                    >
                  </template>
                  <template v-else>
                    {{ it.value }}
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pic">
        <div class="container">
          <div class="row">
            <div
                v-for="(image, index) in brandImage"
                :key="index"
                class="col-md-4"
            >
              <img :src="image" class="w-100" :alt="`品牌圖片 ${index + 1}`" />
            </div>

            <!-- 如果沒有品牌圖片，顯示預設圖片 -->
            <template v-if="brandImage.length === 0">
              <div class="col-md-4">
                <img src="/src/assets/images/success1.jpg" class="w-100" />
              </div>
              <div class="col-md-4">
                <img src="/src/assets/images/success2.jpg" class="w-100" />
              </div>
              <div class="col-md-4">
                <img src="/src/assets/images/success3.jpg" class="w-100" />
              </div>
            </template>
          </div>
        </div>
      </div>
      <Tabs :project-data="projectData" :loading="loading"/>
    </div>
  </div>
  <div class="project-footer">
    <span>
      Lorem ipsum is placeholder text commonly used in the graphic, print, and
      publishing industries for previewing
    </span>
    <img src="@/assets/images/project-bottom.png" class="project-content-img"/>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from "vue";
import {useRoute} from "vue-router";
import {officialPartnerApi} from "@/api/modules/officialPartner.js";
import Tabs from "./Tabs.vue";
import {industryTypeApi} from "@/api/modules/industryType.js";

// 獲取路由參數
const route = useRoute();
const projectData = ref(null);
const loading = ref(false);

// 從 API 獲取專案詳細資料
async function getProjectDetail(id) {
  loading.value = true;
  try {
    const formData = {
      officialPartnerId : Number(id)
    }
    const response = await officialPartnerApi.getOfficialPartner(formData);
    if (response.code === 0) {
      projectData.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取專案詳情失敗:', error);
  } finally {
    loading.value = false;
  }
}

// 處理營運項目圖片
const brandImage = computed(() => {
  if (!projectData.value?.brandImage) return [];

  try {
    // 如果是 JSON 字串，解析它
    return JSON.parse(projectData.value.brandImage);
  } catch (error) {
    // 如果不是有效的 JSON，當作單一圖片處理
    return [projectData.value.brandImage];
  }
});

// 從 API 數據動態生成 detailItems
const detailItems = computed(() => {
  console.log('projectData.value:', projectData.value)
  if (!projectData.value) {
    // 預設數據
    return [
      {label: "領域別", value: "飲料店業"},
      {label: "公司成立狀態", value: "已設立 (2022-06-14)"},
      {label: "資本額", value: "1001萬元"},
      {label: "公司網址", type: "link", value: "https://www.super-milk-tea.com/"},
      {label: "加盟費用", value: "300萬元"},
      {label: "FB粉絲團", type: "link", value: "https://www.facebook.com/super.milk.tea2022"},
      {label: "合作特約優惠", value: "200萬元"},
    ];
  }

  const data = projectData.value;
  return [
    {
      label: "領域別",
      value: industryTypesData.value.find(item => item.id === data.industryType)?.name || "未知"
    },
    {
      label: "公司成立狀態",
      value: `${getCompanyStatusName(data.companyStatus)} (${data.establishedDate})`
    },
    {
      label: "資本額",
      value: `${data.capital}萬元`
    },
    {
      label: "公司網址",
      type: "link",
      value: data.website
    },
    {
      label: "加盟費用",
      value: `${data.franchiseFee}萬元`
    },
    {
      label: "FB粉絲團",
      type: "link",
      value: data.facebook
    },
    {
      label: "合作特約優惠",
      value: `${data.specialOffer}萬元`
    },
  ];
});

// 輔助函數
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

// 組件掛載時獲取數據
onMounted(async () => {
  const projectId = route.params.id;
  if (projectId) {
    await getProjectDetail(projectId);
    await getIndustryTypeName();
  }
});
</script>

<style lang="scss" scoped>
.project {
  &-content {
    background: url("@/assets/images/project-bc.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
    position: relative;
    @media (max-width: 576px) {
      padding: 0 30px;
      background-size: cover;
    }

    .container {
      padding: 0 !important;
    }

    &-img {
      margin: -50px 0;
      width: 100%;
      @media (max-width: 576px) {
        margin: 0;
        height: 30vh;
        object-fit: contain;
      }
    }
  }

  &-bc {
    &-img {
      position: absolute;
      left: 0;
      top: 10%;
      z-index: 0;
      height: 40vh;
    }
  }

  &-footer {
    position: relative;
    @media (max-width: 576px) {
      height: 25vh;
    }

    span {
      position: absolute;
      bottom: 35%;
      right: 10%;
      width: 400px;
      font-weight: 400;
      font-size: 16px;
      line-height: 26px;
      color: #ffffff;
      @media (max-width: 576px) {
        bottom: 15px;
        right: 0;
        padding: 0 25px;
        width: 100%;
      }
    }
  }
}

.media-section-card {
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 2px;
  @media (max-width: 576px) {
    gap: 15px;
  }

  &-image {
    border-radius: 20px;
  }
}

.col-md-8.introduction {
  color: #373a36;
  padding-left: 3rem;
  align-content: center;
  gap: 30px;
  display: flex;
  flex-flow: column;
  @media (max-width: 576px) {
    padding-left: 0;
    padding-right: 0;
  }

  h1 {
    line-height: 43px;
    letter-spacing: 0.1em;
  }

  p {
    font-weight: 400;
    font-size: 16px;
    line-height: 28px;
    color: #555555;
  }
}

.content.row {
  .col-md-6 {
    display: flex;
    overflow-wrap: break-word;
    align-items: center;

    .col-md-4 {
      font-weight: 600;
      font-size: 16px;
      line-height: 28px;
      color: #373a36;
    }

    .col-md-8 {
      a {
        color: #555555;
        text-decoration: none;
      }
    }
  }
}

.swiper-pic {
  margin-bottom: 3rem;

  .container {
    .col-md-4 {
      @media (max-width: 576px) {
        padding: 10px;
      }

      img {
        width: 100%;
        border-radius: 30px;
      }
    }
  }
}

// 載入動畫樣式
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;

  .spinner {
    font-size: 18px;
    color: #ff6634;
  }
}

// 為 HTML 內容添加樣式
:deep(.year) {
  color: #ff6634;
  font-weight: bold;
}

:deep(.highlight) {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 3px;
}

:deep(.feature) {
  color: #28a745;
  font-weight: 600;
}
</style>
