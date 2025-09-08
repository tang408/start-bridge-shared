<template>
  <div class="form-group">
    <div class="label-row">
      <label :for="id">{{ label }}</label>
      <label v-if="publicable" class="public-opt">
        <input type="checkbox" v-model="publicModel" />
        <span>{{ publicLabel }}</span>
      </label>
    </div>
    <textarea
      :id="id"
      v-model="model"
      :rows="rows"
      :required="required"
      :class="{ 'is-invalid': error }"
      v-bind="$attrs"
    ></textarea>
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
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
});
</script>

<style scoped lang="scss">
.form-group {
  text-align: left;
  label {
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    margin-bottom: 6px;
    display: block;
  }
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    resize: vertical;
    min-height: 120px;
    background: transparent;
  }
  .is-invalid {
    border-color: #db3838;
    background: #fff0f0;
  }
  .error-msg {
    font-size: 13px;
    color: #db3838;
    margin-top: 4px;
  }
}
</style>
