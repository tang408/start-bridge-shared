<template>
  <div class="form-group">
    <div class="label-row">
      <label :for="id">{{ label }}</label>
      <label v-if="publicable && !readonly" class="public-opt">
        <input type="checkbox" v-model="publicModel" :disabled="readonly" />
        <span>{{ publicLabel }}</span>
      </label>
    </div>
    <div v-if="description || hasDescSlot" class="desc" :id="descId">
      <slot name="description">{{ description }}</slot>
    </div>
    <textarea
        :id="id"
        v-model="model"
        :rows="rows"
        :required="required"
        :readonly="readonly"
        :disabled="readonly"
        :class="{ 'is-invalid': error, 'is-readonly': readonly }"
        :aria-describedby="description || hasDescSlot ? descId : undefined"
        v-bind="$attrs"
    ></textarea>
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";
defineOptions({ inheritAttrs: false });

const model = defineModel({ type: String, default: "" });
const publicModel = defineModel("public", { type: Boolean, default: false });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  rows: { type: [String, Number], default: 4 },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  error: { type: String, default: "" },
  publicable: { type: Boolean, default: false },
  publicLabel: { type: String, default: "公開" },
  description: { type: String, default: "" },
  readonly: { type: Boolean, default: false },
});

const slots = useSlots();
const hasDescSlot = computed(() => !!slots.description);
const descId = computed(() => `${props.id}-desc`);
</script>

<style scoped lang="scss">
.form-group {
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    resize: vertical;
    min-height: 120px;
    background: transparent;
    transition: all 0.3s;

    &:focus:not(:disabled):not(:read-only) {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
  }

  .is-invalid {
    border-color: #db3838;
    background: #fff0f0;
  }

  .is-readonly {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .desc {
    font-weight: 500;
    font-size: 15px;
    line-height: 22px;
    margin-bottom: 8px;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    label {
      font-weight: 500;
      font-size: 15px;
    }

    .public-opt {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 400;
      font-size: 14px;
      cursor: pointer;

      input[type="checkbox"] {
        cursor: pointer;
      }
    }
  }

  .error-msg {
    color: #db3838;
    font-size: 14px;
    margin-top: 6px;
    margin-bottom: 0;
  }
}
</style>
