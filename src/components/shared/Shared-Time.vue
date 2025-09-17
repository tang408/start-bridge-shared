<template>
  <div class="form-group">
    <label class="fg-label">{{ label }}</label>

    <div class="checks">
      <div class="option" v-for="opt in options" :key="opt.key">
        <input
          type="checkbox"
          :id="`${uid}-${opt.key}`"
          :checked="model[opt.key]?.checked || false"
          @change="onToggle(opt.key, $event.target.checked)"
        />
        <label class="option-label" :for="`${uid}-${opt.key}`">
          {{ opt.text }}
        </label>

        <div v-if="opt.withTime">
          <span class="ms-2">預計在店裡時間：</span>
          <input
            class="textline"
            type="number"
            min="0"
            :value="model[opt.key]?.from || ''"
            :disabled="!model[opt.key]?.checked"
            @input="onInput(opt.key, 'from', $event.target.value)"
          />
          <span class="ms-1">點至</span>
          <input
            class="textline ms-1"
            type="number"
            min="0"
            :value="model[opt.key]?.to || ''"
            :disabled="!model[opt.key]?.checked"
            @input="onInput(opt.key, 'to', $event.target.value)"
          />
          <span class="ms-1">點</span>
        </div>

        <!-- 其他 -->
        <template v-if="opt.key === 'other'">
          <input
            class="textline ms-2"
            type="text"
            :value="model[opt.key]?.value || ''"
            :disabled="!model[opt.key]?.checked"
            @input="onInput(opt.key, 'value', $event.target.value)"
          />
        </template>
      </div>
    </div>
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({ name: "SharedInvestTimePlan" });

const model = defineModel({ type: Object, default: () => ({}) });

const props = defineProps({
  label: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  error: { type: String, default: "" },
});

const uid = computed(() => `tp-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = { checked: false };
}
function onToggle(key, checked) {
  const newModel = {};
  for (const k of Object.keys(model.value)) {
    newModel[k] = { ...model.value[k], checked: false };
  }
  if (checked) {
    newModel[key] = { ...newModel[key], checked: true };
  }

  model.value = newModel;
}
function onInput(key, field, val) {
  ensureKey(key);
  model.value = {
    ...model.value,
    [key]: { ...model.value[key], [field]: val },
  };
}
</script>

<style scoped lang="scss">
.option {
  display: block;
}

input[type="number"].textline {
  width: 50px;
}
</style>
