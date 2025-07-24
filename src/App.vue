<template>
  <router-view :key="$route.path" />
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  console.log("App mounted!");
});
</script>

<style lang="scss">
@use "@/assets/styles/scss/style.scss" as *;
</style>
