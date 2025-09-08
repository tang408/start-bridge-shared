<template>
  <Banner text="門市分布" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/store/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
