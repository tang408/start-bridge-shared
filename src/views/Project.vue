<template>
  <Banner text="專案一覽" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/project/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
