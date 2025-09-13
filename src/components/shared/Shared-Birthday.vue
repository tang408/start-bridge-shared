<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <input
      ref="inputEl"
      :id="id"
      type="date"
      :value="modelValue"
      :min="min"
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
import { ref } from "vue";

const props = defineProps({
  id: { type: String, default: "birthday" },
  label: { type: String, default: "出生年月日*" },
  modelValue: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  min: { type: String, default: "" },
  max: { type: String, default: "" },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "valid-change"]);

const inputEl = ref(null);

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

function inRange(v) {
  if (props.min && v < props.min) return false;
  if (props.max && v > props.max) return false;
  return true;
}
</script>
