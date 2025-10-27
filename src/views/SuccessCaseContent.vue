<template>
  <Banner :text="title" :image="bannerImg" />
  <Main
      @data-loaded="handleDataLoaded"
  ></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/success-content/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
import {computed, ref} from "vue";


const partnerData = ref(null);

// ⭐ 接收子組件傳來的資料
function handleDataLoaded(receivedData) {
  partnerData.value = receivedData;
}

const title = computed(() => {
  return partnerData.value?.name || '合作夥伴';
});
</script>
