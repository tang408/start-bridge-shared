<template>
  <Banner text="顏太煮奶茶(OO店)" :image="bannerImg" />
  <Main :plan-id="currentId"></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/project-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const currentId = computed(() => {
  return route.params.id || props.id;
})

</script>
