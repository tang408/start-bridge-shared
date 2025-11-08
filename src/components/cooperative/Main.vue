<template>
  <Swiper />
  <SharedNews
      :items="transformedItems"
      :page-size="16"
      :categories="industryTypesData"
      :sub-categories="industrySubTypesData"
      :with-all-tab="true"
      @card-click="openDetail"
      @update:category="handleCategoryChange"
      @update:subCategory="handleSubCategoryChange"
      @favorite-change="onFavoriteChange"
  />
  <div id="qa" class="qa-content">
    <div class="qa-content-text">
      <h3>對專案有疑問?</h3>
      <span class="lh-26">
        Lorem ipsum is placeholder text commonly used in the graphic, print, and
        publishing industries for previewing
      </span>
      <button @click="goToQA">創業者QA</button>
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
import {industrySubTypeApi} from "@/api/modules/industrySubType.js";

const router = useRouter();
const {isLoggedIn, currentUser} = useAuth();

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
      const favoritePartnerIds = response.data.founderFavoritePlans.map(
          partner => partner.officialPartnerId
      );

      officialPartnersData.value.forEach(partner => {
        partner.favorite = favoritePartnerIds.includes(partner.id);
      });
    }
  } catch (error) {
    console.error('獲取收藏狀態失敗:', error);
  }
}

async function onFavoriteChange({ id, value }) {
  const target = officialPartnersData.value.find((partner) => partner.id === id);
  if (target) {
    target.favorite = value;
  }

  if (isLoggedIn.value) {
    try {
      const formData = {
        userId: currentUser.value,
        planId: id,
        planType: 2
      }

      if (value) {
        await userFavoritePlanApi.createUserFavoritePlan(formData);
      } else {
        await userFavoritePlanApi.deleteUserFavoritePlan({
          userId: currentUser.value,
          planId: id,
          planType: 2
        });
      }
    } catch (error) {
      console.error('更新收藏狀態失敗:', error);
      if (target) {
        target.favorite = !value;
      }
    }
  }
}

const loading = ref(false);
const officialPartnersData = ref([]);
const industryTypesData = ref([]);
const industrySubTypesData = ref([]);
const selectedIndustryType = ref(null); // ⭐ 改為存儲物件或 null
const selectedIndustrySubType = ref(null); // ⭐ 新增：選中的子類型

// ⭐ 修改：處理主類型變化
async function handleCategoryChange(category) {
  console.log('選擇的類型:', category);

  selectedIndustryType.value = category;
  selectedIndustrySubType.value = null; // 清空子類型選擇

  // 如果是「全部」，獲取所有資料
  if (category === '全部') {
    await getOfficialPartners(0);
    industrySubTypesData.value = []; // 清空子類型
    return;
  }

  // 獲取選中類型的 ID
  const categoryId = typeof category === 'object' ? category.id : category;

  // 獲取該類型下的所有合作夥伴
  await getOfficialPartners(categoryId);

  // 獲取該類型下的所有子類型
  await getIndustrySubTypes(categoryId);
}

// ⭐ 新增：處理子類型變化
function handleSubCategoryChange(subCategory) {
  console.log('選擇的子類型:', subCategory);
  selectedIndustrySubType.value = subCategory;
  // 不需要重新 fetch 資料，因為過濾會在 transformedItems 中自動處理
}

// 獲取行業類型
async function getIndustryTypes() {
  loading.value = true;
  try {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
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

// ⭐ 修改：獲取子類型
async function getIndustrySubTypes(industryTypeId) {
  if (!industryTypeId || industryTypeId === 0) {
    industrySubTypesData.value = [];
    return;
  }

  loading.value = true;
  try {
    const formData = {
      industryTypeId: industryTypeId
    }
    const response = await industrySubTypeApi.getIndustrySubTypes(formData);
    if (response.code === 0) {
      industrySubTypesData.value = response.data || [];
      console.log('獲取的子類型:', response.data);
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取子類型失敗:', error);
    industrySubTypesData.value = [];
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
      officialPartnersData.value = response.data || [];
      console.log('獲取的合作夥伴:', response.data);
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取內容失敗:', error);
    officialPartnersData.value = [];
  } finally {
    loading.value = false;
  }
}

// ⭐ 修改：轉換並過濾資料
const transformedItems = computed(() => {
  if (!officialPartnersData.value || !Array.isArray(officialPartnersData.value)) {
    return [];
  }

  let filtered = officialPartnersData.value;

  // 如果選擇了子類型，進行過濾
  if (selectedIndustrySubType.value) {
    const subTypeId = selectedIndustrySubType.value.id;
    filtered = filtered.filter(partner => {
      // 如果 industrySubType 是 0，表示該合作夥伴沒有子類型
      // 應該只在選擇「無」(id=0) 時顯示
      if (partner.industrySubType === 0) {
        return subTypeId === 0;
      }
      return partner.industrySubType === subTypeId;
    });
  }

  return filtered.map(partner => ({
    id: partner.id,
    title: partner.name,
    cover: partner.photo || '@/assets/images/default-cover.png',
    industryType: partner.industryType, // ⭐ 保留 ID 用於過濾
    industrySubType: partner.industrySubType, // ⭐ 保留 ID 用於過濾
    description: partner.description,
    mode: partner.mode,
    redirectUrl: partner.redirectUrl,
    favorite: partner.favorite || false,
    rawData: partner
  }));
});

// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getIndustryTypes(),
    getOfficialPartners(0), // 初始載入所有資料
    getUserFavoritePlan(),
  ]);
});

const goToQA = () => {
  router.push({ path: "/activity", hash: "#qa" });
};

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
