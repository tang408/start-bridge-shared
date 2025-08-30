<template>
  <swiper
    :modules="[Navigation]"
    :space-between="10"
    :centered-slides="true"
    :loop="true"
    :initial-slide="0"
    navigation
    class="banner-swiper"
    @slideChange="onSlideChange"
    :breakpoints="{
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 1.9,
        spaceBetween: 30,
      },
    }"
  >
    <swiper-slide v-for="(item, index) in banners" :key="index">
      <div
        class="banner-slide"
        :class="{ center: index === activeIndex.value }"
      >
        <img :src="item.photo" alt="" />
        <div
          v-if="index === activeIndex.valueOf && item.title"
          class="center-content"
        >
          {{ item.title }}
        </div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script setup>
import {onMounted, ref} from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {bannerApi} from "@/api/modules/banner.js";

const banners = ref([]);
const loading = ref(false);
async function getBanners() {
  loading.value = true;
  try {
    const formData = {
      type: 3
    }

    const response = await bannerApi.getBanners(formData);
    if (response.code === 0) {
      banners.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取數據失敗:', error);
  } finally {
    loading.value = false;
  }
}
// 組件掛載時獲取數據
onMounted(async () => {
  await getBanners();
});

const activeIndex = ref(0);

function onSlideChange(swiper) {
  if (swiper && typeof swiper.realIndex === "number") {
    activeIndex.value = swiper.realIndex;
  }
}
</script>

<style lang="scss" scoped>
.banner-swiper {
  padding: 40px 0;
  margin: 100px 0;
  @media (max-width: 576px) {
    margin: 70px 30px;
    padding: 0;
  }
  .swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .banner-slide {
    width: 100%;
    height: 446px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    @media (max-width: 576px) {
      height: 300px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.4;
      transition: opacity 0.3s ease;
    }

    &.center img {
      opacity: 1;
    }

    .center-content {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(to right, #ffcc66, #ff6633);
      color: white;
      font-size: 20px;
      font-weight: bold;
      z-index: 2;
    }
  }
}

.swiper-slide-active {
  .banner-slide {
    img {
      opacity: 1;
    }
  }
}

::v-deep(.swiper-button-prev),
::v-deep(.swiper-button-next) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  border-radius: 50px;
  background: #ff5f31;
  color: #fff;
  width: 50px;
  height: 50px;
}

::v-deep(.swiper-button-prev) {
  left: 21%;
  @media (max-width: 768px) {
    left: 1%;
  }
}

::v-deep(.swiper-button-next) {
  right: 21%;
  @media (max-width: 768px) {
    right: 1%;
  }
}

::v-deep(.swiper-button-prev:after),
::v-deep(.swiper-button-next:after) {
  font-size: 25px;
  font-weight: 900;
}
</style>
