<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <VueDatePicker
        v-model="date"
        :id="id"
        class="custom-datepicker"
        :min-date="minDate"
        :max-date="maxDate"
        :required="required"
        :enable-time-picker="false"
        :disabled="readonly"
        :readonly="readonly"
        format="yyyy-MM-dd"
        locale="zh-TW"
        :class="{ 'is-invalid': error, 'is-readonly': readonly }"
        @update:model-value="onDateChange"
    />
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import {ref, watch, computed} from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps({
  id: {type: String, default: "birthday"},
  label: {type: String, default: "出生年月日*"},
  modelValue: {type: String, default: ""},
  error: {type: String, default: ""},
  required: {type: Boolean, default: false},
  min: {type: String, default: ""},
  max: {type: String, default: ""},
  readonly: {type: Boolean, default: false},
});

const emit = defineEmits(["update:modelValue", "valid-change"]);

const date = ref(props.modelValue ? new Date(props.modelValue) : null);

// 轉換 min/max 字串為 Date 物件
const minDate = computed(() => props.min ? new Date(props.min) : null);
const maxDate = computed(() => props.max ? new Date(props.max) : null);

watch(() => props.modelValue, (newVal) => {
  date.value = newVal ? new Date(newVal) : null;
});

function onDateChange(value) {
  if (props.readonly) return; // 防止 readonly 模式下改變

  if (value) {
    const formatted = value.toISOString().split('T')[0];
    emit("update:modelValue", formatted);
  } else {
    emit("update:modelValue", "");
  }
  emitValid();
}

function emitValid() {
  const ok = (!props.required && !props.modelValue) || !!props.modelValue;
  emit("valid-change", ok);
}
</script>

<style scoped lang="scss">
.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 15px;
  }
}

.custom-datepicker {
  width: 100%;

  // 隱藏日曆圖標
  :deep(.dp__input_icon) {
    display: none;
  }

  // readonly 樣式
  &.is-readonly {
    :deep(.dp__input) {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  // 錯誤樣式
  &.is-invalid {
    :deep(.dp__input) {
      border-color: #db3838;
      background: #fff0f0;
    }
  }

  // 調整輸入框樣式
  :deep(.dp__input) {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }

    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
}

.error-msg {
  color: #db3838;
  font-size: 14px;
  margin-top: 6px;
  margin-bottom: 0;
}
</style>
