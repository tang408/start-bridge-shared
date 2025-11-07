<template>
  <Banner text="平台合約聲明" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/terms/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
