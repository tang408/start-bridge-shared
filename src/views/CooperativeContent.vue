<template>
  <Banner text="顏太煮奶茶(品牌內頁)" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/Cooperative-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";

const props = defineProps({
  id: { type: [String, Number], required: true },
});
</script>
