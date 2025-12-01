<template>
  <div class="progress-section-swiper">
    <swiper
      :slides-per-view="slidesPerView"
      :centered-slides="centeredSlides"
      :space-between="spaceBetween"
      :initial-slide="0"
      :watch-slides-visibility="true"
      :loop-additional-slides="2"
      :loop="loop"
      :looped-slides="cards.length"
      :navigation="{
        nextEl: '.' + nextElClass,
        prevEl: '.' + prevElClass,
      }"
      :preventClicks="true"
      :preventClicksPropagation="true"
      class="progress-section-swiper-content"
    >
      <swiper-slide v-for="card in cards" :key="card.id">
        <SharedCard
          :mode="mode"
          :card="card"
          :show-progress="true"
          :show-info="true"
          @card-click="handleCardClick"
        >
        </SharedCard>
      </swiper-slide>
    </swiper>
    <div :class="prevElClass">
      <img src="@/assets/icon/left-arrow-white.svg" />
    </div>
    <div :class="nextElClass">
      <img src="@/assets/icon/right-arrow-white.svg" />
    </div>
  </div>
</template>

<script setup>
import SharedCard from "@/components/shared/Shared-Card.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
SwiperCore.use([Navigation]);

defineProps({
  cards: Array,
  prevElClass: String,
  nextElClass: String,
  mode: { type: String, default: "progress" },
  linkBase: { type: String, default: "/project" },
  routeName: { type: String, default: "ProjectDetail" },
  isFeatured: { type: Boolean, default: false },
  isRemainingPartners: { type: Boolean, default: false },
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

const router = useRouter();

function handleCardClick(card) {
  if (card?.to) {
    router.push(card.to);
    return;
  }
}
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
      display: flex;
      justify-content: center;
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
