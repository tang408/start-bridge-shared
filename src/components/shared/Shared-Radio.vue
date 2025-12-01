<template>
  <div class="form-group">
    <label v-if="label" class="fg-label">{{ label }}</label>
    <div class="radio-options">
      <div
          v-for="option in options"
          :key="option.value"
          class="radio-option"
      >
        <input
            type="radio"
            :id="`${uid}-${option.value}`"
            :name="name"
            :value="option.value"
            :checked="modelValue === option.value"
            @change="$emit('update:modelValue', option.value)"
            :disabled="disabled"
        />
        <label :for="`${uid}-${option.value}`">{{ option.text }}</label>

        <!-- ✅ 當選項被選中且有 withInput 時顯示輸入框 -->
        <template v-if="option.withInput && modelValue === option.value">
          <!-- 編輯模式 -->
          <input
              v-if="!disabled"
              type="text"
              :value="extra?.[option.value] || ''"
              @input="$emit('update:extra', { ...extra, [option.value]: $event.target.value })"
              class="radio-input"
              placeholder="請輸入"
          />

          <!-- ✅ Readonly 模式 -->
          <input
              v-else
              type="text"
              :value="extra?.[option.value] || ''"
              readonly
              disabled
              class="radio-input"
          />
        </template>
      </div>
    </div>
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({ name: "SharedRadio" });

const props = defineProps({
  id: String,
  label: String,
  modelValue: String,
  extra: Object,
  name: String,
  options: Array,
  error: String,
  disabled: Boolean
});

defineEmits(['update:modelValue', 'update:extra']);

const uid = computed(() => props.id || `radio-${Math.random().toString(36).slice(2, 9)}`);
</script>

<style lang="scss" scoped>
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.fg-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 15px;
  color: #333;
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  label {
    padding-left: 28px;
    position: relative;
    cursor: pointer;
    line-height: 1.6;
    font-weight: 400;
    flex-shrink: 0;

    &::before {
      content: "";
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid #bbb;
      border-radius: 50%;
      background: #fff;
      position: absolute;
      left: 0;
      top: 2px;
      transition: all 0.2s;
      box-sizing: border-box;
    }
  }

  input:checked + label::before {
    background: #ff6634;
    border-color: #ff6634;
    box-shadow: 0 0 0 2px rgba(255, 102, 52, 0.2);
  }

  input:checked + label::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
  }

  input:disabled + label {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .radio-input {
    padding: 8px 12px;
    margin-left: 0.5rem;
    flex: 1;
    max-width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    /* ✅ Readonly 樣式 */
    &:disabled,
    &[readonly] {
      background-color: #f8f9fa;
      color: #495057;
      cursor: default;
      border-color: #e9ecef;
    }
  }
}

.error-text {
  font-size: 13px;
  color: #db3838;
  margin-top: 4px;
  display: block;
}
</style>
