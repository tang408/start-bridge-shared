<template>
  <div class="tabs mb-4">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-btn"
      :class="{ active: tab.value === modelValue }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
  },
});

defineEmits(["update:modelValue"]);
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  gap: $gap-10;
  justify-content: center;
  @media (max-width: 576px) {
    gap: 3px;
  }
}
.tab-btn {
  padding: $pd-1020;
  border: none;
  border-radius: 8px;
  background: $btn-gradient;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  cursor: pointer;

  @media (max-width: 576px) {
    padding: 10px;
  }
}
.tab-btn.active {
  background: $btn-orange;
  color: $white;
  border-radius: $br-8;
  height: 40px;
}
</style>
