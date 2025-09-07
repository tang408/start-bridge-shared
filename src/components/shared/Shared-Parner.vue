<template>
  <div class="service-partners">
    <div class="container">
      <div class="service-title" v-if="title">
        <h1>{{ title }}</h1>
      </div>

      <div class="logo-grid" role="list">
        <!-- 先隱藏 -->
        <!-- <div v-for="i in count" :key="i" class="logo-item" role="listitem">
        <img :src="imgSrc" :alt="`${altBase}-${i}`" loading="lazy" />
      </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: { type: String, default: "合作夥伴" },
  count: { type: Number, default: 20 },
  src: { type: String, default: "" },
  altBase: { type: String, default: "partner" },
});

const imgSrc = computed(() =>
  props.src && props.src.length
    ? props.src
    : new URL("@/assets/images/logo-only.png", import.meta.url).href
);
</script>

<style lang="scss" scoped>
.service {
  &-partners {
    padding: 4rem 0;
    min-height: 60vh;
    .container {
      gap: 50px;
      display: grid;
    }
  }
  &-title {
    text-align: center;
    letter-spacing: 0.1em;
    h1 {
      font-weight: 700;
      font-size: 36px;
      line-height: 43px;
      @media (max-width: 767px) {
        font-size: 28px;
      }
    }
  }
}

.logo {
  &-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    align-items: center;

    @media (min-width: 768px) {
      grid-template-columns: repeat(10, 1fr);
      gap: 20px;
    }
  }
  &-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    img {
      width: 100%;
      height: auto;
      max-height: 60px;
      object-fit: contain;
    }
  }
}
</style>
