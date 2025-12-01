<template>
  <Banner text="參與風險聲明、平台免責聲明" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/terms-risk-notice/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
