<template>
  <Banner text="啟動/參與" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/activity/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
