<template>
  <div class="form-group">
    <label v-if="label" class="fg-label">
      {{ label }} <span v-if="required" class="req">*</span>
    </label>

    <div class="checks" :class="{ inline }">
      <div
          class="option"
          v-for="opt in options"
          :key="opt.key"
      >
        <input
            type="checkbox"
            :id="`${uid}-${opt.key}`"
            :checked="model[opt.key]?.checked || false"
            :disabled="readonly"
            @change="onToggle(opt.key, $event.target.checked)"
        />
        <label class="option-label" :for="`${uid}-${opt.key}`">
          {{ opt.text }}
        </label>

        <!-- ✅ 編輯模式 -->
        <input
            v-if="(opt.placeholder !== undefined || opt.withInput === true) && model[opt.key]?.checked && !readonly"
            class="textline"
            :type="opt.inputType || 'text'"
            :value="model[opt.key]?.value || ''"
            @input="onInput(opt.key, $event.target.value)"
            :placeholder="opt.placeholder || '請輸入'"
            :min="opt.min"
        />

        <input
            v-if="(opt.placeholder !== undefined || opt.withInput === true) && model[opt.key]?.checked && readonly"
            class="textline w-auto"
            :type="opt.inputType || 'text'"
            :value="model[opt.key]?.value || ''"
            readonly
            disabled
            :min="opt.min"
        />
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";

defineOptions({ name: "SharedCheckline" });

const model = defineModel({ type: Object, default: () => ({}) });

const props = defineProps({
  label: { type: String, default: "" },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  inline: { type: Boolean, default: false },
  single: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  type: { type: String, default: "" },
});

const uid = computed(() => `cli-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = { checked: false, value: "" };
}

function onToggle(key, checked) {
  if (props.readonly) return;

  if (props.single) {
    // Single selection mode - uncheck all others
    const newModel = {};
    props.options.forEach((opt) => {
      newModel[opt.key] = { 
        checked: opt.key === key && checked, 
        value: opt.key === key ? (model.value[key]?.value || "") : "" 
      };
    });
    model.value = newModel;
  } else {
    // Multiple selection mode
    if (key === 'anytime' && checked) {
      // If 'anytime' is checked, uncheck all others
      const newModel = {};
      props.options.forEach((opt) => {
        newModel[opt.key] = { 
          checked: opt.key === 'anytime', 
          value: "" 
        };
      });
      model.value = newModel;
    } else {
      // For other checkboxes
      const currentValue = model.value[key]?.value || "";
      
      // Create a new object to trigger reactivity
      const newModel = { ...model.value };
      
      // If checking a non-anytime option, uncheck anytime
      if (checked && key !== 'anytime' && newModel.anytime) {
        newModel.anytime = { checked: false, value: "" };
      }
      
      // Update the current key
      newModel[key] = { checked, value: currentValue };
      
      model.value = newModel;
    }
  }
}

function onInput(key, val) {
  if (props.readonly) return;

  ensureKey(key);
  
  // Find the option config for this key
  const option = props.options.find(opt => opt.key === key);
  
  // If it's a number input with a min value, enforce the minimum
  let finalValue = val;
  if (option?.inputType === 'number' && option?.min !== undefined) {
    const numValue = Number(val);
    if (!isNaN(numValue) && numValue < option.min) {
      finalValue = String(option.min);
    }
  }
  
  model.value = { ...model.value, [key]: { ...model.value[key], value: finalValue } };
}

watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        Object.assign(model.value, newVal);
      }
    },
    { deep: true }
);
</script>

<style scoped lang="scss">
.form-group {
  width: 100%;
  margin-bottom: 20px;
}

.fg-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 16px;
}

.req {
  color: #f44336;
}

.checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

input[type="checkbox"] {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.option-label {
  flex: 0 1 auto; /* ✅ 可以縮小，不會無限擴大 */
  max-width: 500px; /* ✅ 最大寬度限制 */
  white-space: normal; /* ✅ 允許換行 */
  word-wrap: break-word; /* ✅ 長文字換行 */
  line-height: 1.5;
}

.textline {
  /* ✅ 修改這裡：給一個固定的合理寬度 */
  width: 300px; /* 或 150px, 根據需求調整 */
  min-width: 200px; /* 最小寬度 */
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
  box-sizing: border-box;

  /* 響應式 */
  @media (max-width: 768px) {
    width: 150px;
  }

  &:disabled,
  &[readonly] {
    background-color: #f8f9fa;
    color: #495057;
    cursor: default;
    border-color: #e9ecef;
    opacity: 1;
  }

  &:not(:disabled):not(:read-only):focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
}

/* ✅ 針對 number 類型的特別處理 */
input[type="number"].textline {
  text-align: right;
  width: 120px; /* 數字輸入框可以更窄 */
}

.checks.inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;

  .option {
    flex: 1 1 300px;
    min-width: 300px;
  }
}

.error-msg {
  color: #f44336;
  font-size: 14px;
  margin-top: 6px;
  margin-bottom: 0;
}
</style>
