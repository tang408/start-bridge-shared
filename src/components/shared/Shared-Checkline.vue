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
          @change="onToggle(opt.key, $event.target.checked)"
        />
        <label class="option-label" :for="`${uid}-${opt.key}`">
          {{ opt.text }}
        </label>
        <input
          v-if="opt.withInput !== false"
          class="textline ml"
          :type="opt.inputType || 'text'"
          :value="model[opt.key]?.value || ''"
          :disabled="!model[opt.key]?.checked"
          @input="onInput(opt.key, $event.target.value)"
        />
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({ name: "SharedCheckline" });

const model = defineModel({ type: Object, default: () => ({}) });

const props = defineProps({
  label: { type: String, default: "" },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  inline: { type: Boolean, default: false },
  single: { type: Boolean, default: false },
});

const uid = computed(() => `cli-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = { checked: false, value: "" };
}

function onToggle(key, checked) {
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
    model.value = { ...model.value, [key]: { ...model.value[key], checked } };
  }
}

function onInput(key, val) {
  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], value: val } };
}
</script>

<style scoped lang="scss">
input[type="number"].textline {
  width: 80px;
  text-align: right;
}
</style>
