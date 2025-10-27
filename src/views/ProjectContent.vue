<template>
  <Banner :text="title" :image="bannerImg" />
  <Main :plan-id="currentId" @data-loaded="handleDataLoaded" />
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/project-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";
import { useRoute } from "vue-router";
import {computed, ref} from "vue";

const route = useRoute();

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const currentId = computed(() => {
  return route.params.id || props.id;
})

const partnerData = ref(null);


function handleDataLoaded(receivedData) {
  partnerData.value = receivedData;
  console.log('收到子組件資料:', receivedData);
}

const title = computed(() => {
  return partnerData.value?.name || '合作夥伴';
});
</script>
