<template>
  <div class="image-section">
    <div class="background">
      <img :src="platformImg" alt="平台圖" />
    </div>
  </div>
</template>

<script setup>
import platformImg from "@/assets/images/platform.jpg";
</script>

<style lang="scss" scoped>
.image-section {
  position: relative;
  width: 100%;
  overflow: hidden;

  .background {
    background-image: url("@/assets/images/about-bc2.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 100px 0;
  }

  img {
    width: 70%;
  }
}
</style>
