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
          :showInfo="true"
          @favorite-toggle="handleFavoriteToggle"
          @card-click="handlePlanClick"
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
          @favorite-toggle="handleFavoriteToggle"
          @card-click="handleBrandClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedCard from "@/components/shared/Shared-Card.vue";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";
import {useAuth} from "@/composables/useAuth.js";

const {isLoggedIn, currentUser} = useAuth();
const activeTab = ref(1);
const userFavoritePlans = ref(null);

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
  }));
});

const entCards = computed(() => {
  if (!userFavoritePlans.value?.founderFavoritePlans) return [];

  return userFavoritePlans.value.founderFavoritePlans.map(partner => ({
    id: partner.officialPartnerId,
    img: partner.officialPartnerImage,
    title: partner.officialPartnerName,
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
    alert("取消收藏失敗，請稍後再試");
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
  display: flex;
  gap: 25px;
  @media (max-width: 576px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
