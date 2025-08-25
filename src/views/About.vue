<template>
  <Banner text="關於我們" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/about/Main.vue";
import bannerImg from "@/assets/images/banner-about.jpg";
</script>
<style lang="scss" scoped></style>
