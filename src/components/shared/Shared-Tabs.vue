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
      <span v-if="tab.badge && tab.badge > 0" class="tab-badge">
        {{ tab.badge > 99 ? '99+' : tab.badge }}
      </span>
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
  position: relative; // 新增：為 badge 定位
  padding: $pd-1020;
  border: none;
  border-radius: 8px;
  background: $btn-gradient;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  cursor: pointer;

  white-space: nowrap;

  @media (max-width: 576px) {
    padding: 10px;
    font-size: 14px;
  }
}

.tab-btn.active {
  background: $btn-orange;
  color: $white;
  border-radius: $br-8;
  height: 40px;
}

// 新增：Badge 樣式
.tab-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ff4444;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 576px) {
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    font-size: 11px;
  }
}

// 當按鈕處於 active 狀態時，badge 顏色可以調整
.tab-btn.active .tab-badge {
  background: #ff6634;
}
</style>
