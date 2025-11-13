<template>
  <Banner text="服務條款" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/terms-service/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
