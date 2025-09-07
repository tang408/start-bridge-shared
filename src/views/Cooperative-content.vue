<template>
  <Banner text="" :image="bannerImg" />

  <Main :preview-mode="isPreviewMode" :partner-id="currentId"></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/Cooperative-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";

// 必須先聲明 route 和 router
const route = useRoute();
const router = useRouter();

const props = defineProps({
  id: { type: [String, Number], required: true },
});

// 檢查是否為預覽模式
const isPreviewMode = computed(() => {
  console.log('Route Query:', route.query.preview)
  return route.query.preview === 'true';
});

// 獲取當前 ID（來自路由參數或查詢參數）
const currentId = computed(() => {
  if (route.query.preview === 'true') {
    return route.query.id;
  }
  return route.params.id || props.id;
});

</script>
