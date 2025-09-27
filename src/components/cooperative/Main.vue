<template>
  <Swiper />
  <SharedNews
    :items="transformedItems"
    :page-size="16"
    :categories="industryTypeNames"
    :with-all-tab="true"
    @card-click="openDetail"
    @favorite-change="onFavoriteChange"
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
import { useRouter } from "vue-router";
import Swiper from "./Swiper.vue";
import SharedNews from "@/components/shared/Shared-News.vue";
import img1 from "@/assets/images/news-1.png";
import img2 from "@/assets/images/news-2.png";
import img3 from "@/assets/images/news-3.png";
import img4 from "@/assets/images/news-4.png";
import {officialPartnerApi} from "@/api/modules/officialPartner.js";
import {computed, onMounted, ref} from "vue";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {useAuth} from "@/composables/useAuth.js";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";

const router = useRouter();
const {isLoggedIn, currentUser} = useAuth();

const cat = ["餐飲", "生活服務", "商人項目", "海外貿易"];
const sampleImages = [img1, img2, img3, img4];

const items = ref(
  Array.from({ length: 80 }).map((_, i) => ({
    id: i + 1,
    title: `最新消息最新消息標題最新消息標題標題最新消息標題`,
    cover: sampleImages[i % 4],
    category: cat[i % cat.length],
    favorite: false,
  }))
);

function openDetail(card) {
  if (card.mode === 'url' && card.redirectUrl) {
    window.open(card.redirectUrl, '_blank');
    return;
  } else if (card.mode === 'data') {
    router.push({ name: "CooperativeBrandDetail", params: { id: card.id } });
  }
}
async function getUserFavoritePlan() {
  if (!isLoggedIn.value) {
    return;
  }

  const formData = {
    userId: currentUser.value,
  }

  try {
    const response = await userFavoritePlanApi.getUserFavoritePlans(formData)
    if (response.code === 0) {
      // 提取收藏的官方合作夥伴 ID 列表
      const favoritePartnerIds = response.data.founderFavoritePlans.map(
          partner => partner.officialPartnerId
      );

      // 更新每個合作夥伴的收藏狀態
      officialPartnersData.value.forEach(partner => {
        partner.favorite = favoritePartnerIds.includes(partner.id);
      });
    }
  } catch (error) {
    console.error('獲取收藏狀態失敗:', error);
  }
}

async function onFavoriteChange({ id, value }) {
  // 找到對應的項目並更新收藏狀態
  const target = officialPartnersData.value.find((partner) => partner.id === id);
  if (target) {
    target.favorite = value;
  }

  // 如果用戶已登入，同步到後端
  if (isLoggedIn.value) {
    try {
      const formData = {
        userId: currentUser.value,
        planId: id,
        planType: 2 // 2 表示合作夥伴
      }

      if (value) {
        // 添加收藏
        await userFavoritePlanApi.createUserFavoritePlan(formData);
      } else {
        // 取消收藏
        await userFavoritePlanApi.deleteUserFavoritePlan({
          userId: currentUser.value,
          planId: id,
          planType: 2
        });
      }
    } catch (error) {
      console.error('更新收藏狀態失敗:', error);
      // 如果後端操作失敗，回復前端狀態
      if (target) {
        target.favorite = !value;
      }
    }
  }
}

const loading = ref(false);

const officialPartnersData = ref([]);
const industryTypesData = ref([]);
const selectedIndustryType = ref('全部');

const industryTypeNames = computed(() => {
  return industryTypesData.value.map(item => item.name);
});

// 根據分類名稱找到對應的 ID
const selectedCategoryId = computed(() => {
  if (selectedIndustryType.value === '全部') {
    return 0; // 全部分類傳 0
  }

  const industryType = industryTypesData.value.find(item => item.name === selectedIndustryType.value);
  return industryType ? industryType.id : 0; // 找不到也傳 0
});

function getIndustryTypeName(industryTypeId) {
  const industryType = industryTypesData.value.find(item => item.id === industryTypeId);
  return industryType ? industryType.name : '未分類';
}

function handleCategoryChange(industryTypeName) {
  selectedIndustryType.value = industryTypeName;
  const industryTypeId = selectedCategoryId.value;
  getOfficialPartners(industryTypeId);
}

// 獲取行業類型
async function getIndustryTypes() {
  loading.value = true;
  try {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
      // 保存完整的資料（包含 id 和 name）
      industryTypesData.value = response.data;
      console.log('獲取的行業類型:', response.data);
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取行業類型失敗:', error);
  } finally {
    loading.value = false;
  }
}

async function getOfficialPartners(industryType = 0) {
  loading.value = true;
  try {
    const formData = {
      industryType: industryType
    }
    const response = await officialPartnerApi.getOfficialPartners(formData);
    if (response.code === 0) {
      officialPartnersData.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取內容失敗:', error);
  } finally {
    loading.value = false;
  }
}

const transformedItems = computed(() => {
  if (!officialPartnersData.value || !Array.isArray(officialPartnersData.value)) {
    return [];
  }

  return officialPartnersData.value.map(partner => ({
    id: partner.id,
    title: partner.name,
    cover: partner.photo || '@/assets/images/default-cover.png', // 使用 API 圖片或預設圖片
    category: getIndustryTypeName(partner.industryType), // 根據 industryType 轉換為分類名稱
    description: partner.description,
    mode: partner.mode, // 保留模式資訊
    redirectUrl: partner.redirectUrl, // 保留跳轉 URL
    favorite: partner.favorite || false,
    rawData: partner // 保留完整的原始資料
  }));
});


// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getIndustryTypes(),
    getOfficialPartners(0),
    getUserFavoritePlan(),

  ]);
});

</script>

<style lang="scss" scoped>
.qa-content {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    url("@/assets/images/brand-bc-5.png");
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
    left: 200px;
    @media (max-width: 576px) {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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
</style>
