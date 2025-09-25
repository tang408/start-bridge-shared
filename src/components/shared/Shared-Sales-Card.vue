<template>
  <div class="sales-card" :class="{ strong }">
    <div class="sales-card-title">
      {{ title }}
    </div>
    <div class="sales-card-body" :class="[`cols-${cols}`]">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  strong: { type: Boolean, default: false },
  cols: { type: Number, default: 1 },
});
</script>

<style scoped lang="scss">
.sales-card {
  background: #fff;
  border-radius: 0;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: left;

  &-title {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.3) 0%,
      rgba(255, 102, 52, 0.3) 100%
    );
    border-bottom: 1px solid $btn-orange;
    color: $btn-orange;
    font-weight: $fw-600;
    font-size: $fs-15;
    line-height: 30px;
    padding: 10px 30px;
  }

  &-body {
    padding: 10px 30px;
    font-weight: $fw-400;
    font-size: $fs-14;
    line-height: 24px;
    color: $text-dark;
    min-height: 88px;
    align-content: center;
    &.cols-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
      @media (max-width: 768px) {
        display: block;
      }
    }

    &.cols-1 {
      display: block;
    }
  }

  &.strong {
    .sales-card-title {
      background: #ff6a3d;
      color: #fff;
    }
  }
}
</style>
