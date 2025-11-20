<template>
  <div class="image-section">
    <div class="background">
      <img :src="privacyImg1" alt="平台圖" />
      <img :src="privacyImg2" alt="平台圖" />
    </div>
  </div>
</template>

<script setup>
import privacyImg1 from "@/assets/images/privacy1.jpg";
import privacyImg2 from "@/assets/images/privacy2.jpg";
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
    flex-flow: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 100px 0;
    gap: 30px;
  }

  img {
    width: 70%;
    @media (max-width: 767px) {
      width: 90%;
    }
  }
}
</style>
