<template>
  <div class="service-icon-wrapper">
    <div class="service-icon" v-for="(item, index) in icons" :key="index">
      <img :src="item.img" height="150" class="mb-3" />
      <div class="service-icon-content">
        <h3>{{ item.title }}</h3>
        <hr />
        <span>{{ item.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icons: {
    type: Array,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.service {
  &-icon-wrapper {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 3rem;
    @media (max-width: 767px) {
      gap: 20px;
      display: grid;
    }
  }

  &-icon {
    @media (max-width: 767px) {
      display: flex;
      align-items: center;
      border-radius: 15px;
      background: rgba(255, 255, 255, 0.3);
      box-shadow: 2px 2px 6px rgba(144, 129, 129, 0.25);
      backdrop-filter: blur(2px);
      padding: 20px;
      gap: 10px;
    }
    img {
      @media (max-width: 767px) {
        width: 50px;
        height: 50px;
      }
    }

    &-content {
      h3 {
        font-family: "Noto Sans TC";
        font-style: normal;
        font-weight: 700;
        font-size: 24px;
        line-height: 29px;
        letter-spacing: 2px;
        text-align: center;
        color: #ff6634;
        @media (max-width: 767px) {
          font-size: 18px;
          text-align: start;
        }
      }
      hr {
        border: 2px solid #f64c24;
        @media (max-width: 767px) {
          margin: 0;
        }
      }
      span {
        font-weight: 400;
        font-size: 18px;
        line-height: 26px;
        color: #373a36;
        @media (max-width: 767px) {
          font-size: 14px;
          text-align: start;
        }
      }
    }
  }
}
</style>
