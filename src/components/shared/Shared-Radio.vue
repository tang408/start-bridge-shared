<template>
  <div class="form-group">
    <label>{{ label }}</label>
    <p v-if="desc" class="fs-14">{{ desc }}</p>
    <div class="checks mt-2">
      <div class="option" v-for="opt in options" :key="opt.value">
        <input
          type="radio"
          :id="`${uid}-${opt.value}`"
          :name="name || uid"
          :value="opt.value"
          :disabled="disabled"
          v-model="model"
        />
        <label class="option-label" :for="`${uid}-${opt.value}`" :class="{ 'disabled': disabled }">
          {{ opt.text }}
        </label>
        <input
          v-if="opt.withInput"
          class="textline ms-2"
          type="text"
          :value="(extra && extra[opt.value]) || ''"
          :disabled="model !== opt.value"
          @input="updateExtra($event.target.value, opt.value)"
        />
      </div>
    </div>
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
const model = defineModel({ type: String, default: "" });
const extra = defineModel("extra");

const props = defineProps({
  label: { type: String, required: true },
  desc: { type: String, default: "" },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  name: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});
const uid = computed(() => `rg-${Math.random().toString(36).slice(2, 9)}`);
function updateExtra(val, optValue) {
  extra.value = { ...extra.value, [optValue]: val };
}
</script>
<style lang="scss" scoped>
.checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  width: 100%;
}

.option {
  display: flex;
  align-items: flex-start; // 改成 flex-start,讓多行文字對齊更好看
  gap: 8px;

  /* 沒有 textline 的選項,自動寬度 */
  &:not(:has(.textline)) {
    flex: 0 0 auto;
  }

  /* 有 textline 的選項,延伸到最右邊 */
  &:has(.textline) {
    flex: 1 1 100%;
    width: 100%;
  }

  @media (max-width: 576px) {
    flex: 1 1 100%;
    width: 100%;
  }

  input[type="radio"] {
    flex-shrink: 0;
    margin-top: 2px; // 微調對齊
  }

  .option-label {
    flex: 0 1 auto; // 改成 0 1 auto,允許文字換行
    white-space: normal; // 允許換行
    max-width: 100%; // 限制最大寬度
    word-break: break-word; // 長英文單詞自動斷行
    cursor: pointer;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .textline {
    flex: 1;
    min-width: 0;
    max-width: none;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;

    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    @media (max-width: 576px) {
      flex: 1 1 100%;
      margin-left: 0;
    }
  }
}

.error-msg {
  color: #f44336;
  font-size: 14px;
  margin-top: 6px;
}

.fs-14 {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  margin-bottom: 8px;
}
</style>
