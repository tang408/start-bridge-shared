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
          :for="`${uid}-${opt.key}`"
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
        <input
            v-if="opt.withInput !== false"
            class="textline"
            :type="opt.inputType || 'text'"
            :value="model[opt.key]?.value || ''"
            :disabled="!model[opt.key]?.checked || readonly"
            :readonly="readonly"
            @input="onInput(opt.key, $event.target.value)"
        />
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import {computed, watch} from "vue";

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
  // 預覽模式不允許切換
  if (props.readonly) return;

  ensureKey(key);

  if (props.single) {
    const newModel = {};
    props.options.forEach((opt) => {
      newModel[opt.key] = { checked: false, value: "" };
    });
    if (checked) {
      newModel[key] = {
        ...newModel[key],
        checked: true,
        value: model.value[key]?.value || "",
      };
    }
    model.value = newModel;
  } else {
    // 特殊邏輯：處理 'anytime' 的互斥
    if (key === 'anytime' && checked) {
      // 選擇 anytime 時，清除其他所有選項
      const newModel = {};
      props.options.forEach((opt) => {
        newModel[opt.key] = { checked: false, value: "" };
      });
      newModel.anytime = { checked: true, value: "" };
      model.value = newModel;
    } else if (key !== 'anytime' && checked) {
      // 選擇其他選項時，清除 anytime
      const newModel = { ...model.value };
      if (newModel.anytime) {
        newModel.anytime = { checked: false, value: "" };
      }
      newModel[key] = { ...model.value[key], checked };
      model.value = newModel;
    } else {
      // 取消勾選的情況
      model.value = { ...model.value, [key]: { ...model.value[key], checked } };
    }
  }
}

function onInput(key, val) {
  // 預覽模式不允許輸入
  if (props.readonly) return;

  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], value: val } };
}

// 監聽 modelValue 變化
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
  flex-shrink: 0;
  white-space: nowrap;
  margin: 0;
  cursor: pointer;
  font-size: 15px;
}

.textline {
  flex: 1;
  min-width: 0;
  width: auto;
  max-width: none;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
  box-sizing: border-box;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    color: #999;
  }

  &:read-only {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:not(:disabled):not(:read-only):focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
}

input[type="number"].textline {
  text-align: right;
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
