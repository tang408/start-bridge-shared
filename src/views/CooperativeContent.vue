<template>
  <Banner :text="title" :image="bannerImg" />

  <Main :preview-mode="isPreviewMode" :partner-id="currentId"  @data-loaded="handleDataLoaded"></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/Cooperative-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";

// 必須先聲明 route 和 router
const route = useRoute();

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

const partnerData = ref(null);

// ⭐ 接收子組件傳來的資料
function handleDataLoaded(receivedData) { // ⭐ 參數改名
  partnerData.value = receivedData; // ⭐ 正確賦值
  console.log('收到子組件資料:', receivedData);
}

const title = computed(() => {
  return partnerData.value?.name || '合作夥伴'; // ⭐ 使用可選鏈
});

</script>
