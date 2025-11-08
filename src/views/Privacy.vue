<template>
  <Banner text="隱私權政策" :image="bannerImg" />
  <Main></Main>
</template>

<script setup>
import Banner from "@/components/shared/Shared-Banner.vue";
import Main from "@/components/terms-privacy/Main.vue";
import bannerImg from "@/assets/images/project-banner.png";
</script>
