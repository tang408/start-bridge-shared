<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <input
        ref="inputEl"
        :id="id"
        type="date"
        :value="modelValue"
        :min="minDate"
        :max="max"
        :required="required"
        :class="{ 'is-invalid': error }"
        @focus="openPicker"
        @click="openPicker"
        @input="onInput"
        @blur="emitValid()"
    />
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  id: { type: String, default: "birthday" },
  label: { type: String, default: "出生年月日*" },
  modelValue: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  min: { type: String, default: "" },
  max: { type: String, default: "" },
  readonly: { type: Boolean, default: false },
  allowPastDates: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "valid-change"]);

const inputEl = ref(null);

// 修正後的 getTodayDate() 函式，回傳 YYYY-MM-DD 格式
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 修正後的計算最小日期邏輯
const minDate = computed(() => {
  const today = getTodayDate();
  if (props.min) {
    return props.min > today ? props.min : today;
  }

  return today;
});

function openPicker() {
  if (props.readonly) return;
  const el = inputEl.value;
  if (!el) return;
  if (typeof el.showPicker === "function") {
    el.showPicker();
  } else {
    el.focus();
  }
}

function onInput(e) {
  const val = e.target.value;
  emit("update:modelValue", val);
  emitValid();
}

function emitValid() {
  const ok =
      (!props.required && !props.modelValue) ||
      (props.modelValue &&
          isValidDate(props.modelValue) &&
          inRange(props.modelValue));
  emit("valid-change", ok);
}

function isValidDate(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v);
  return !isNaN(d.getTime());
}

// inRange 函式不需要修正，因為它使用字串比對，只要格式正確即可
function inRange(v) {
  if (minDate.value && v < minDate.value) return false;
  if (props.max && v > props.max) return false;
  return true;
}
</script>
