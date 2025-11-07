<template>
  <div class="form-group">
    <label class="fg-label"> {{ label }}</label>
    <div class="checks" >
      <label class="fg-label" v-if="type === 'recruit'"> 招聘管道：</label>

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
            :disabled="readonly"
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
            :disabled="readonly || !model[opt.key]?.checked"
            :readonly="readonly"
            @input="onInput(opt.key, $event.target.value)"
        />
      </div>
    </div>
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({ name: "SharedRecruitChannels" });

const model = defineModel({ type: Object, default: () => ({}) });

const props = defineProps({
  label: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  error: { type: String, default: "" },
  type: { type: String, default: "" },
  readonly: { type: Boolean, default: false }, // ✅ 新增
});

const uid = computed(() => `rc-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = { checked: false, value: "" };
}

function onToggle(key, checked) {
  if (props.readonly) return; // ✅ readonly 時不處理

  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], checked } };
}

function onInput(key, val) {
  if (props.readonly) return; // ✅ readonly 時不處理

  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], value: val } };
}
</script>

<style lang="scss" scoped>
.checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  width: 100%;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto; /* 預設自動寬度 */

  /* 有輸入框的選項 */
  &:has(.textline) {
    flex: 1 1 100%;
    width: 100%;
  }

  input[type="checkbox"] {
    flex-shrink: 0;

    /* ✅ readonly 樣式 */
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .option-label {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .textline {
    flex: 1;
    min-width: 0;
    max-width: none;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;

    /* ✅ readonly 樣式 */
    &:disabled,
    &[readonly] {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.8;
    }
  }
}

.error-msg {
  color: #f44336;
  font-size: 14px;
  margin-top: 6px;
}

.fg-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
</style>
