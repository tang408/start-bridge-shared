<template>
  <Banner text="合作品牌" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/cooperative/Main.vue";
import bannerImg from "@/assets/images/banner-example.jpg";
</script>
<style lang="scss" scoped></style>
