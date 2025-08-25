<template>
  <Banner text="創媒之星" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/star/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
