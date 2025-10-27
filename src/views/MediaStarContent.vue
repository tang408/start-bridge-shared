<template>
  <Banner :text="title" :image="bannerImg" />
  <Main
    @data-loaded="handleDataLoaded"
  ></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/star-content/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
import {computed, ref} from "vue";


const partnerData = ref(null);

function handleDataLoaded(receivedData) {
  partnerData.value = receivedData;
}

const title = computed(() => {
  return partnerData.value?.name || '合作夥伴';
});
</script>
