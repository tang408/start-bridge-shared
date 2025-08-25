<template>
  <Banner text="顏太煮奶茶(OO店)" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/project-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";
</script>
