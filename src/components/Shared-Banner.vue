<template>
  <div class="banner">
    <div class="banner-text">{{ text }}</div>
    <div class="banner-mask">
      <img :src="image" class="w-100" />
    </div>
    <img src="@/assets/images/banner-bc.png" class="w-100 banner-bc" />
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.banner {
  height: 480px;
  position: relative;
  @media (max-width: 576px) {
    height: 370px;
  }
  &-mask {
    width: 100%;
    height: 437px;
    display: inline-flex;
    position: absolute;
    z-index: 2;
    @media (max-width: 576px) {
      height: 370px;
    }
    img {
      object-fit: cover;
      border-radius: 0 0 0 200px;
    }
  }
  &-mask::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: #373a36;
    opacity: 0.7;
    pointer-events: none;
    border-radius: 0 0 0 200px;
  }
  &-bc {
    height: 437px;
    position: absolute;
    top: 25px;
    z-index: 1;
    left: 7px;
    @media (max-width: 991px) {
      object-fit: cover;
      object-position: left;
      left: 5px;
      top: 15px;
    }
    @media (max-width: 576px) {
      height: 370px;
    }
  }
  &-text {
    color: #fff;
    position: absolute;
    top: 50%;
    left: 19%;
    z-index: 3;
    font-style: normal;
    font-weight: 700;
    font-size: 36px;
    line-height: 40px;
    letter-spacing: 0.02em;
    transform: translateY(-50%);
    @media (max-width: 576px) {
      width: 70%;
      font-size: 30px;
    }
  }
}
</style>
