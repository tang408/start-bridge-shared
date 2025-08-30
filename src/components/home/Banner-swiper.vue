<template>
  <div class="banner">
    <swiper
      :modules="modules"
      :loop="true"
      :autoplay="{ delay: 7000 }"
      :pagination="{ clickable: true }"
      class="banner-swiper"
    >
      <swiper-slide v-for="(img, index) in banners" :key="index">
        <img :src="img.photo"  alt="banner" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import {onMounted, ref} from "vue";
import {bannerApi} from "@/api/modules/banner.js";

const modules = [Autoplay, Pagination];
const banners = ref([]);
const loading = ref(false);
async function getBanners() {
  loading.value = true;
  try {
    const formData = {
      type: 1
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

</script>

<style lang="scss" scoped>
.banner {
  @media (max-width: 767px) {
    margin-top: 0;
    padding-top: 80px;
    background-color: #f64c24;
  }

  .banner-swiper {
    width: 100%;
    height: auto;
    background: #f54c23;
    img {
      width: 100%;
      max-width: 1140px;
      display: block;
    }

    ::v-deep(.swiper-pagination) {
      position: absolute;
      bottom: 10px;
      left: 0;
      width: 100%;
      height: 30px;
      text-align: center;
      z-index: 10;
    }

    ::v-deep(.swiper-pagination-bullet) {
      background: rgba(255, 255, 255, 0.6);
      margin: 0 4px;
      width: 10px;
      height: 10px;
      opacity: 1;
      border-radius: 50%;
      display: inline-block;
    }

    ::v-deep(.swiper-pagination-bullet-active) {
      background: #ff714a;
    }
  }
}

.swiper-slide {
  display: flex;
  justify-content: center;
}
</style>
