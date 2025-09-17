<template>
  <div class="form-group">
    <label>{{ label }}</label>
    <p v-if="desc" class="fs-14">{{ desc }}</p>
    <div class="checks mt-2">
      <div class="option" v-for="opt in options" :key="opt.value">
        <input
          type="radio"
          :id="`${uid}-${opt.value}`"
          :name="name || uid"
          :value="opt.value"
          :disabled="disabled"
          v-model="model"
        />
        <label class="option-label" :for="`${uid}-${opt.value}`" :class="{ 'disabled': disabled }">
          {{ opt.text }}
        </label>
        <input
          v-if="opt.withInput"
          class="textline ms-2"
          type="text"
          :value="(extra && extra[opt.value]) || ''"
          :disabled="model !== opt.value"
          @input="updateExtra($event.target.value, opt.value)"
        />
      </div>
    </div>
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
const model = defineModel({ type: String, default: "" });
const extra = defineModel("extra");

const props = defineProps({
  label: { type: String, required: true },
  desc: { type: String, default: "" },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  name: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});
const uid = computed(() => `rg-${Math.random().toString(36).slice(2, 9)}`);
function updateExtra(val, optValue) {
  extra.value = { ...extra.value, [optValue]: val };
}
</script>
<style lang="scss" scoped>
.option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  @media (max-width: 576px) {
    display: block;
  }

  .option-label {
    flex: 0 0 auto;
    padding-left: 28px;
  }

  .textline {
    flex: 1;
    max-width: 200px;
    @media (max-width: 576px) {
      flex: 1 1 100%;
      margin-left: 28px;
      max-width: 100%;
    }
  }
}
</style>
