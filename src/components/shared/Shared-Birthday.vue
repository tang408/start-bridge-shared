<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <VueDatePicker
        v-model="date"
        :id="id"
        class="custom-datepicker"
        :min-date="min"
        :max-date="max"
        :required="required"
        :enable-time-picker="false"
        format="yyyy-MM-dd"
        locale="zh-TW"
        :disabled="readonly"
        :readonly="readonly"
        :class="{ 'is-invalid': error, 'is-readonly': readonly }"
        @update:model-value="onDateChange"
    />
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
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
  readonly: {type: Boolean, default: false}, // 新增 readonly prop
});

const emit = defineEmits(["update:modelValue", "valid-change"]);

const date = ref(props.modelValue ? new Date(props.modelValue) : null);

watch(() => props.modelValue, (newVal) => {
  date.value = newVal ? new Date(newVal) : null;
});

function onDateChange(value) {
  if (props.readonly) return; // 如果是 readonly 狀態，不處理變更

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

<style scoped>
/* 調整日曆圖標的位置 */
.custom-datepicker :deep(.dp__input_icon) {
  display: none;
}

/* readonly 樣式 */
.custom-datepicker.is-readonly :deep(.dp__input) {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

.custom-datepicker.is-readonly :deep(.dp__input_wrap) {
  pointer-events: none;
}
</style>
