<template>
  <div
    v-if="mode === 'progress'"
    class="progress-section-card"
    @click="onCardClick"
  >
    <img :src="card.photo ? card.photo : card.img" class="progress-section-card-image w-100" />
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


    <div class="progress-section-card-content">
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
        <span>
          <img src="@/assets/icon/swiper-icon1.svg" alt="" />
          {{ card.price }}
        </span>
        <span>
          <img src="@/assets/icon/swiper-icon2.svg" alt="" />
          {{ card.supporters }}
        </span>
      </div>
      <slot />
    </div>
  </div>

  <div v-else-if="mode === 'store'" class="store-section-card" @click="$emit('card-click', card)">
    <img :src="card.photo" class="store-section-card-image w-100 mb-2" />
    <slot name="store-address">
      <div>門市地址 | {{ storeAddress }}</div>
    </slot>
    <slot name="store-phone">
      <div>門市電話 | {{ storePhone }}</div>
    </slot>
    <slot />
  </div>
</template>

<script setup>
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";
import {useAuth} from "@/composables/useAuth.js";
import {userFavoritePlanApi} from "@/api/modules/userFavoritePlan.js";
import { onMounted } from "vue";
const props = defineProps({
  card: { type: Object, required: true },
  mode: { type: String, default: "progress" },
  showProgress: { type: Boolean, default: true },
  showInfo: { type: Boolean, default: true },
  storeAddress: { type: String, default: "—" },
  storePhone: { type: String, default: "—" },
  showFavorite: { type: Boolean, default: true },
});

const emit = defineEmits(["card-click", "favorite-toggle"]);

function onCardClick() {
  emit("card-click", props.card);
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
    alert("請先登入會員");
    return;
  }
  console.log(props.mode)
  if (props.mode !== 'progress') {
    return;
  }
  console.log(props.card.favorite)
  if (props.card.favorite) {
    // 取消收藏
    const formData = {
      userId: currentUser.value,
      planId: props.card.id,
      planType: 1
    }

    const response = await userFavoritePlanApi.deleteUserFavoritePlan(formData)
    if (response.code !== 0) {
      alert("取消收藏失敗，請稍後再試");
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
      alert("加入收藏失敗，請稍後再試");
      return;
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-section-card {
  position: relative;
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

    &-image {
      width: 100%;
      border-radius: 15px 15px 0px 0px;
      height: 145px;
      object-fit: cover;
      object-position: bottom;
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
</style>
