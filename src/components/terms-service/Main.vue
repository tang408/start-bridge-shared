<template>
  <div class="image-section">
    <div class="background">
      <img :src="serviceImg1" alt="服務條款" />
      <img :src="serviceImg2" alt="服務條款" />
      <img :src="serviceImg3" alt="服務條款" />
    </div>
  </div>
</template>

<script setup>
import serviceImg1 from "@/assets/images/service01.png";
import serviceImg2 from "@/assets/images/service02.png";
import serviceImg3 from "@/assets/images/service03.png";
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
