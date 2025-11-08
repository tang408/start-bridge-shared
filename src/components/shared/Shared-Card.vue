<template>
  <div
      v-if="mode === 'progress' || mode === 'userFavorites'"
      class="progress-section-card"
      @click="onCardClick"
  >
    <img :src="card.photo ? card.photo : card.img" class="common-image w-100"/>
    <SharedFabActions
        v-if="showFavorite"
        :favorite="card.favorite"
        :showTrash="false"
        iconType="heart"
        size="sm"
        :right="10"
        :top="10"
        :circleSize="35"
        :iconSize="20"
        @click.stop
        @favorite-toggle="toggleFavorite"
    />


    <div class="progress-sction-card-info-extra">
      <slot name="tags">
        <div class="progress-section-card-tags" v-if="card.tags?.length">
          <span
              v-for="(t, i) in card.tags"
              :key="i"
              :class="['progress-section-card-tags-' + (t.type || 'black')]"
          >
            {{ t.text }}
          </span>
        </div>
      </slot>

      <div class="progress-section-card-title">
        {{ card.title }}
      </div>

      <div class="progress-section-card-progress-bar" v-if="showProgress">
        <div
            class="progress-section-card-progress-bar-inner"
            :style="{ width: (card.progress ?? 0) + '%' }"
        ></div>
        <span class="progress-percent">{{ card.progress ?? 0 }}%</span>
      </div>

      <div class="progress-section-card-info" v-if="showInfo">
        <div class="info-stats">
    <span class="info-item">
      <img src="@/assets/icon/swiper-icon1.svg" alt=""/>
      {{ card.price }}
    </span>
          <span class="info-item">
      <img src="@/assets/icon/swiper-icon2.svg" alt=""/>
      {{ card.supporters }}
    </span>
        </div>
        <div class="info-action">
          <button class="tab-btn"
                  v-if="showDownloadButton"
            @click.stop="handleDownloadPlan(card)"
          >下載創業企劃書</button>
        </div>
      </div>

      <div class="progress-sction-card-info-extra" v-if="showBrandInfo">
        <div class="info-row">
          <span class="info-label">產業類型</span>
          <span class="info-value">{{ card.industryType }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">合作特約優惠</span>
          <span class="info-value">{{ card.specialOffer }} 萬元</span>
        </div>
        <div class="info-row">
          <span class="info-label">加盟費</span>
          <span class="info-value">{{ card.franchiseFee }} 萬元</span>
        </div>
        <div>
          <button class="tab-btn mt-2">
            詳細資訊
          </button>
          <button
              class="tab-btn mt-2"
              @click.stop="handleParticipantPlanInfo(card)"
          >
            媒合中專案
          </button>
          <button class="tab-btn mt-2"
                  @click.stop="handleCreatePlan(card)"
          >
            申請創業
          </button>
        </div>
      </div>
      <slot/>
    </div>
  </div>

  <div v-else-if="mode === 'store'" class="store-section-card" @click="$emit('card-click', card)">
    <img :src="card.photo" class="store-section-card-image w-100 mb-2"/>
    <slot name="store-name">
      <div>門市名稱 | {{ storeName }}</div>
    </slot>
    <slot name="store-address">
      <div>門市地址 | {{ storeAddress }}</div>
    </slot>
    <slot name="store-phone">
      <div>門市電話 | {{ storePhone }}</div>
    </slot>
    <slot/>
  </div>
</template>

<script setup>
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";
import {useAuth} from "@/composables/useAuth.js";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";
import {onMounted} from "vue";
import {NewAlert} from "@/composables/useAlert.js";

const props = defineProps({
  card: {type: Object, required: true},
  mode: {type: String, default: "progress"},
  showProgress: {type: Boolean, default: true},
  showInfo: {type: Boolean, default: true},
  showBrandInfo: {type: Boolean, default: false},
  storeName: {type: String, default: "—"},
  storeAddress: {type: String, default: "—"},
  storePhone: {type: String, default: "—"},
  showFavorite: {type: Boolean, default: true},
  showDownloadButton: {type: Boolean, default: false},
});

const emit = defineEmits(["card-click", "favorite-toggle","download-plan"]);

function onCardClick() {
  emit("card-click", props.card);
}

function handleParticipantPlanInfo(card) {
  console.log("handleParticipantPlanInfo clicked", card)
}

function handleCreatePlan(card) {
  console.log("handleCreatePlan clicked", card)
}

function handleDownloadPlan(card) {
  console.log("handleDownloadPlan clicked", card)
  emit("download-plan", card);
}

const {isLoggedIn, currentUser} = useAuth();

async function getUserFavoritePlan() {
  if (!isLoggedIn.value) {
    return;
  }
  const formData = {
    userId: currentUser.value,
  }
  const response = await userFavoritePlanApi.getUserFavoritePlans(formData)
  if (response.code === 0) {
    // 檢查 planFavoritePlans 陣列中是否包含當前卡片的 planId
    const isFavorite = response.data.planFavoritePlans.some(
        plan => plan.planId === props.card.id
    );

    // 設置卡片的收藏狀態
    props.card.favorite = isFavorite;
  }
}

onMounted(() => {
  if (props.mode === 'progress' && props.showFavorite) {
    getUserFavoritePlan();
  }
});

async function toggleFavorite(newVal) {
  if (currentUser.value === null) {
    await NewAlert.show("請先登入","請先登入以使用收藏功能");
    return;
  }

  // 如果是在收藏頁面，直接 emit 給父組件處理
  if (props.mode === 'userFavorites') {
    emit("favorite-toggle", {
      favorite: props.card.favorite,
      cardId: props.card.id,
      planType: props.showProgress ? 1 : 2  // 1: 專案, 2: 品牌
    });
    return;
  }

  if (props.card.favorite) {
    // 取消收藏
    const formData = {
      userId: currentUser.value,
      planId: props.card.id,
      planType: 1
    }

    const response = await userFavoritePlanApi.deleteUserFavoritePlan(formData)
    if (response.code !== 0) {
      await NewAlert.show("注意！", response.message + ",取消收藏失敗，請洽客服人員。");
      return;
    }

    emit("favorite-toggle", newVal);
  } else {
    const formData = {
      userId: currentUser.value,
      planId: props.card.id,
      planType: 1
    }

    const response = await userFavoritePlanApi.createUserFavoritePlan(formData)
    emit("favorite-toggle", newVal);
    if (response.code !== 0) {
      await NewAlert.show("注意！", response.message + ",收藏失敗，請洽客服人員。");
      return;
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-section-card {
  position: relative;
}

.common-image {
    width: 100%;
    height: 150px; // 固定高度，可依需求調整
    object-fit: cover; // 保持比例裁切填滿
    object-position: center; // 置中顯示（或改用 top、bottom 等）
    display: block; // 避免圖片底部出現空隙

    @media (max-width: 767px) {
      height: 145px; // 手機版可以設定較小的高度
    }
}

.favorite-btn-wrap {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.progress-section {
  &-card {
    cursor: pointer;
    background: #fff;
    border-radius: $br-15;
    padding: 15px;
    margin: 5px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: left;
    display: flex;
    flex-flow: column;
    gap: $gap-10;

    @media (max-width: 767px) {
      width: 90%;
      height: 100%;
      margin: auto;
      gap: $gap-5;
    }

    &-tags {
      margin: 10px 0;

      &-red {
        background: #f65332;
        color: white;
        padding: 2px 6px;
        border-radius: $br-4;
        font-size: $fs-12;
        margin-right: 5px;
      }

      &-black {
        background: #333;
        color: white;
        padding: 2px 6px;
        border-radius: $br-4;
        font-size: $fs-12;
      }
    }

    &-content {
      display: flex;
      flex-flow: column;
      gap: $gap-10;
      @media (max-width: 767px) {
        gap: $gap-5;
      }
    }

    &-title {
      font-weight: $fw-500;
      font-size: $fs-15;
      line-height: $lh-24;
      letter-spacing: 1px;
      color: #373838;

      @media (max-width: 767px) {
        font-size: $fs-15;
      }
    }

    &-progress-bar {
      position: relative;
      overflow: hidden;
      height: 15px;
      background: linear-gradient(
              90deg,
              $brand-yellow 0%,
              #ff5f31 86.53%,
              rgba(255, 255, 255, 0) 86.54%
      );
      border: 1px solid #d9d9d9;
      border-radius: $br-20;
      @media (max-width: 767px) {
        height: 20px;
      }

      .progress-percent {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: $fs-12;
        font-weight: $fw-900;
        color: #fff;
        z-index: 1;
        pointer-events: none;
      }
    }

    &-info {
      display: flex;
      justify-content: space-between;
      font-size: $fs-14;
    }
  }
}

.store-section-card {
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  letter-spacing: $ls-2;
  cursor: pointer; // 新增
  &-image {
    border-radius: $br-20;
  }
}

.tab-btn {
  padding: $pd-1020;
  border: none;
  border-radius: 8px;
  background: $btn-gradient;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  cursor: pointer;

  @media (max-width: 576px) {
    padding: 10px;
  }
}

.tab-btn.active {
  background: $btn-orange;
  color: $white;
  border-radius: $br-8;
  height: 40px;
}

.progress-sction-card-info-extra {
  font-size: 14px;
  color: #666;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  line-height: 1.6;
}

.info-label {
  color: #888;
  margin-right: 12px;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.tab-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  background-color: #f8f8f8;
  border-color: #ccc;
}

.progress-section-card-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;

  .info-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #666;

      img {
        width: 16px;
        height: 16px;
      }
    }
  }

  .info-action {
    .download-btn {
      width: 100%;
      padding: 8px 16px;
      background-color: #ff6634;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #ff4814;
      }
    }
  }
}
</style>
