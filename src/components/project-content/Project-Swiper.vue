<template>
  <div class="banner">
    <swiper
      :modules="modules"
      :loop="true"
      :autoplay="{ delay: 7000 }"
      :pagination="{ clickable: true }"
      class="banner-swiper"
    >
      <swiper-slide v-for="(img, index) in images" :key="index">
        <img :src="img" alt="banner" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
});

console.log(props.images)
//轉換成陣列

const modules = [Autoplay, Pagination];

</script>

<style lang="scss" scoped>
.banner {
  margin: 30px 0 60px 0;
  @media (max-width: 767px) {
    margin-top: 0;
  }

  .banner-swiper {
    width: 100%;
    height: 300px;
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
