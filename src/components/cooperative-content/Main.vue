<template>
  <div v-if="loading" class="loading-container">
    <div class="spinner">載入中...</div>
  </div>
  <div v-else class="project-content">
    <!-- 預覽模式提示 -->
    <div v-if="previewMode" class="preview-notice">
      <p>🔍 您正在預覽合作夥伴資料，此為後台管理員預覽功能</p>
    </div>

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
                v-if="allBrandContent.length > 0"
                v-for="(item, index) in allBrandContent"
                :key="index"
                class="col-md-4 mb-3"
            >
              <!-- 如果是 YouTube 連結 -->
              <div v-if="item.type === 'youtube'" class="ratio ratio-16x9">
                <iframe
                    :src="getYouTubeEmbedUrl(item.url)"
                    :title="`品牌影片 ${index + 1}`"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="rounded"
                ></iframe>
              </div>

              <!-- 如果是圖片 -->
              <img
                  v-else-if="item.type === 'image'"
                  :src="item.url"
                  class="w-100 rounded"
                  :alt="`品牌圖片 ${index + 1}`"
              />
            </div>
          </div>
        </div>
      </div>
      <Tabs :project-data="projectDataWithExtraFields" :loading="loading"/>
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

// 新增 props
const props = defineProps({
  previewMode: { type: Boolean, default: false },
  partnerId: { type: [String, Number], required: false }
});


// 獲取路由參數
const route = useRoute();
const projectData = ref(null);
const loading = ref(false);

// 從 API 獲取專案詳細資料
const emit = defineEmits(['data-loaded']);
async function getProjectDetail(id) {
  loading.value = true;
  try {
    let response;

    if (props.previewMode || route.query.preview === 'true') {
      // 預覽模式：調用預覽 API
      const formData = {
        id: Number(id)
      }
      response = await officialPartnerApi.getOfficialPartnerPreviewData(formData);

      if (response.code === 0 && response.data) {
        // 檢查 response.data 的結構
        if (Array.isArray(response.data) && response.data.length > 0) {
          projectData.value = response.data[0];
        } else if (typeof response.data === 'object') {
          projectData.value = response.data;
        } else {
          throw new Error('預覽數據格式錯誤');
        }

      } else {
        throw new Error('API 響應格式錯誤或無資料');
      }
    } else {
      // 正常模式：使用原有 API
      const formData = {
        officialPartnerId: Number(id)
      }
      response = await officialPartnerApi.getOfficialPartner(formData);
      if (response.code === 0) {
        projectData.value = response.data;
        emit('data-loaded', response.data);
      } else {
        throw new Error('API 響應格式錯誤');
      }
    }


  } catch (error) {
    console.error('獲取專案詳情失敗:', error);
  } finally {
    loading.value = false;
  }
}
const projectDataWithExtraFields = computed(() => {
  if (!projectData.value) {
    return null;
  }
  // 將 customFields 轉換為 extraFields 格式
  const extraFields = {};

  if (projectData.value.customFields) {
    Object.entries(projectData.value.customFields).forEach(([categoryKey, fields]) => {
      extraFields[categoryKey] = fields.map(field => ({
        key: field.fieldKey.toString(),
        displayName: field.fieldName,
        value: field.fieldValue
      }));
    });
  }

  return {
    ...projectData.value,
    extraFields: extraFields
  };
});

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

// 處理 YouTube 連結
const youtubeUrls = computed(() => {
  if (!projectData.value?.youtubeUrls) return [];

  try {
    // 如果是 JSON 字串，解析它
    return JSON.parse(projectData.value.youtubeUrls);
  } catch (error) {
    // 如果不是有效的 JSON，當作單一連結處理
    return [projectData.value.youtubeUrls];
  }
});

// 合併所有品牌內容（圖片 + YouTube）
const allBrandContent = computed(() => {
  const content = [];

  // 加入圖片（先檢查是否為陣列）
  if (Array.isArray(brandImage.value)) {
    brandImage.value.forEach(imageUrl => {
      if (imageUrl && imageUrl.trim()) {
        content.push({
          type: 'image',
          url: imageUrl
        });
      }
    });
  }

  // 加入 YouTube 影片（先檢查是否為陣列）
  if (Array.isArray(youtubeUrls.value)) {
    youtubeUrls.value.forEach(youtubeUrl => {
      if (youtubeUrl && youtubeUrl.trim() && isYouTubeUrl(youtubeUrl)) {
        content.push({
          type: 'youtube',
          url: youtubeUrl
        });
      }
    });
  }

  return content;
});

// 將 YouTube 連結轉換為嵌入格式
const getYouTubeEmbedUrl = (url) => {
  let videoId = '';

  // 處理 youtube.com/watch?v= 格式
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('watch?v=')[1].split('&')[0];
  }
  // 處理 youtu.be/ 格式
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }
  // 處理已經是 embed 格式
  else if (url.includes('youtube.com/embed/')) {
    return url;
  }

  return `https://www.youtube.com/embed/${videoId}`;
};


// 檢查是否為 YouTube 連結的輔助函數
const isYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
};

// 從 API 數據動態生成 detailItems
const detailItems = computed(() => {
  if (!projectData.value) {
    // 預設數據
    return [
      {label: "領域別", value: "飲料店業"},
      {label: "公司成立狀態", value: "已設立 (2022-06-14)"},
      {label: "資本額", value: "1001元"},
      {label: "公司網址", type: "link", value: "https://www.super-milk-tea.com/"},
      {label: "加盟費用", value: "300元"},
      {label: "社群媒體", type: "link", value: "https://www.facebook.com/super.milk.tea2022"},
      {label: "合作特約優惠", value: "200元"},
    ];
  }

  const data = projectData.value;
  return [
    {
      label: "領域別",
      value: industryTypesData.value.find(item => item.id === data.industryType)?.name || "未知"
    },
    {
      label: "資本額",
      value: `${formatAmount(data.capital)}元`
    },
    {
      label: "公司網址",
      type: "link",
      value: data.website
    },
    {
      label: "加盟費用",
      value: `${formatAmount(data.franchiseFee)}元`
    },
    {
      label: "社群媒體",
      type: "link",
      value: data.facebook
    },
    {
      label: "合作特約優惠",
      value: `${formatAmount(data.specialOffer)}元`
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

const formatAmount = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const getCompanyStatusName = (status) => {
  const statuses = {
    1: "已設立",
    2: "籌備中",
    // 添加更多狀態映射
  };
  return statuses[status] || "未知";
};

const getCurrentId = () => {
  // 預覽模式：route.query.id
  if (route.query.preview === 'true' && route.query.id) {
    return route.query.id;
  }
  // Props 模式：props.partnerId
  if (props.partnerId) {
    return props.partnerId;
  }
  // 正常模式：route.params.id
  return route.params.id;
};

// 組件掛載時獲取數據
onMounted(async () => {
  const projectId = getCurrentId();
  if (projectId) {
    await getIndustryTypeName();
    await getProjectDetail(projectId);
  } else {
    console.error('無法獲取有效的項目 ID');
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
