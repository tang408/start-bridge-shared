<template>
  <div class="form-group">
    <label>{{ label }}</label>
    <div class="checks mt-3">
      <div class="option" v-for="opt in options" :key="opt.value">
        <input
          type="radio"
          :id="`${uid}-${opt.value}`"
          :name="name || uid"
          :value="opt.value"
          v-model="model"
        />
        <label class="option-label" :for="`${uid}-${opt.value}`">
          {{ opt.text }}
        </label>
      </div>
    </div>
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
const model = defineModel({ type: String, default: "" });

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  name: { type: String, default: "" },
});
const uid = computed(() => `rg-${Math.random().toString(36).slice(2, 9)}`);
</script>
<style lang="scss" scoped>
.checks {
  display: flex;
  gap: 20px;
  .option {
    input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    &-label {
      position: relative;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      &::before {
        content: "";
        display: inline-block;
        width: 18px;
        height: 18px;
        margin-right: 8px;
        border: 2px solid #bbb;
        border-radius: 4px;
        background: #fff;
        box-sizing: border-box;
        transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
      }
    }
  }

  .option input:checked + .option-label::before {
    background: #ff6634;
    border-color: #ff6634;
    box-shadow: 0 0 0 2px rgba(255, 102, 52, 0.2);
  }

  .option input:focus-visible + .option-label::before {
    outline: 2px solid #333;
    outline-offset: 2px;
  }

  .option input:disabled + .option-label {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
