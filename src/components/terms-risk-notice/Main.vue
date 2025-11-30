<template>
  <div class="image-section">
    <div class="background">
      <img :src="riskNoticeImg1" alt="參與風險、平台免責聲明" />
      <img :src="riskNoticeImg2" alt="參與風險、平台免責聲明" />
    </div>
  </div>
</template>

<script setup>
import riskNoticeImg1 from "@/assets/images/risk-notice01.png";
import riskNoticeImg2 from "@/assets/images/risk-notice02.png";
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
