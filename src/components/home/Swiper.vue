<template>
  <div class="progress-section-swiper">
    <swiper
      :slides-per-view="slidesPerView"
      :centered-slides="centeredSlides"
      :space-between="spaceBetween"
      :initial-slide="1"
      :watch-slides-visibility="true"
      :loop-additional-slides="2"
      :loop="loop"
      :looped-slides="cards.length"
      :navigation="{
        nextEl: '.' + nextElClass,
        prevEl: '.' + prevElClass,
      }"
      class="progress-section-swiper-content"
    >
      <swiper-slide v-for="card in cards" :key="card.id">
        <div class="progress-section-card">
          <img :src="card.img" class="progress-section-card-image w-100" />
          <div class="progress-section-card-content">
            <div class="progress-section-card-title">
              {{ card.title }}
            </div>
            <div class="progress-section-card-progress-bar">
              <div
                class="progress-section-card-progress-bar-inner"
                :style="{ width: card.progress + '%' }"
              ></div>
              <span class="progress-percent">{{ card.progress }}%</span>
            </div>
            <div class="progress-section-card-info">
              <span>
                <img src="@/assets/icon/swiper-icon1.svg" alt="" />
                {{ card.price }}
              </span>
              <span>
                <img src="@/assets/icon/swiper-icon2.svg" alt="" />
                {{ card.supporters }}
              </span>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <div :class="prevElClass">‹</div>
    <div :class="nextElClass">›</div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import { ref, onMounted } from "vue";
SwiperCore.use([Navigation]);

defineProps({
  cards: Array,
  prevElClass: String,
  nextElClass: String,
});

const slidesPerView = ref(4);
const spaceBetween = ref(20);
const centeredSlides = ref(false);
const loop = ref(false);

onMounted(() => {
  if (window.innerWidth <= 767) {
    slidesPerView.value = 1.25;
    centeredSlides.value = true;
    spaceBetween.value = 0;
    loop.value = true;
  } else {
    slidesPerView.value = 4;
    centeredSlides.value = false;
    spaceBetween.value = 20;
    loop.value = false;
  }
});

import "swiper/swiper-bundle.css";
</script>

<style lang="scss" scoped>
.progress-section {
  &-swiper {
    position: relative;
    &-content {
      width: 1040px;
      @media (max-width: 767px) {
        width: 100%;
        padding: 8px 16px;
        box-sizing: border-box;
      }
    }

    .swiper-slide {
      display: flex;
      @media (min-width: 768px) {
        justify-content: center;
      }
    }
  }

  &-card {
    background: #fff;
    border-radius: 15px;
    padding: 15px;
    margin: 5px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 350px;
    height: auto;
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

.progress {
  &-prev,
  &-next {
    &-1,
    &-2 {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      background: #ff6634;
      color: white;
      width: 50px;
      height: 50px;
      font-size: 50px;
      line-height: 40px;
      text-align: center;
      align-items: center;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.21);
      @media (max-width: 767px) {
        transform: translateY(0%);
        top: revert;
        bottom: -60px;
      }
      &:hover {
        background: #fa551e;
      }
    }
  }
  &-prev {
    &-1,
    &-2 {
      left: -35px;
      @media (max-width: 767px) {
        left: 20%;
      }
    }
  }
  &-next {
    &-1,
    &-2 {
      right: -35px;
      @media (max-width: 767px) {
        right: 20%;
      }
    }
  }

  &-prev-2,
  &-next-2 {
    @media (max-width: 767px) {
      display: none;
    }
  }
}
</style>
