<template>
  <div
    v-if="mode === 'progress'"
    class="progress-section-card"
    @click="$emit('card-click', card)"
  >
    <img :src="card.img" class="progress-section-card-image w-100" />

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

  <div v-else-if="mode === 'store'" class="store-section-card">
    <img :src="card.img" class="store-section-card-image w-100 mb-2" />
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
defineProps({
  card: { type: Object, required: true },
  mode: { type: String, default: "progress" },
  showProgress: { type: Boolean, default: true },
  showInfo: { type: Boolean, default: true },
  storeAddress: { type: String, default: "—" },
  storePhone: { type: String, default: "—" },
});

defineEmits(["card-click"]);
</script>

<style lang="scss" scoped>
.progress-section {
  &-card {
    cursor: pointer;
    background: #fff;
    border-radius: 15px;
    padding: 15px;
    margin: 5px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: left;
    display: flex;
    flex-flow: column;
    gap: 10px;

    @media (max-width: 767px) {
      width: 90%;
      height: 100%;
      margin: auto;
      gap: 5px;
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
        border-radius: 4px;
        font-size: 12px;
        margin-right: 5px;
      }

      &-black {
        background: #333;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    &-content {
      display: flex;
      flex-flow: column;
      gap: 10px;
      @media (max-width: 767px) {
        gap: 5px;
      }
    }

    &-title {
      font-weight: 600;
      font-size: 15px;
      line-height: 24px;
      letter-spacing: 1px;
      color: #373838;

      @media (max-width: 767px) {
        font-size: 15px;
      }
    }

    &-progress-bar {
      position: relative;
      overflow: hidden;
      height: 15px;
      background: linear-gradient(
        90deg,
        #ffcc66 0%,
        #ff5f31 86.53%,
        rgba(255, 255, 255, 0) 86.54%
      );
      border: 1px solid #d9d9d9;
      border-radius: 20px;
      @media (max-width: 767px) {
        height: 20px;
      }
      .progress-percent {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        z-index: 1;
        pointer-events: none;
      }
    }

    &-info {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      @media (max-width: 767px) {
        font-size: 14px;
      }
    }
  }
}

.store-section-card {
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 2px;
  &-image {
    border-radius: 20px;
  }
}
</style>
