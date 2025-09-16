<template>
  <div class="form-group">
    <label class="fg-label"> {{ label }}</label>
    <div class="checks">
      <label class="fg-label"> 招聘管道：</label>

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
          v-if="opt.key === 'other'"
          class="textline ms-2"
          type="text"
          :value="model[opt.key]?.value || ''"
          :disabled="!model[opt.key]?.checked"
          @input="onInput(opt.key, $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({ name: "SharedRecruitChannels" });

const model = defineModel({ type: Object, default: () => ({}) });

const props = defineProps({
  label: { type: String, default: "" },
  options: { type: Array, default: () => [] },
});

const uid = computed(() => `rc-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = { checked: false, value: "" };
}
function onToggle(key, checked) {
  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], checked } };
}
function onInput(key, val) {
  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], value: val } };
}
</script>

<style scoped lang="scss"></style>
