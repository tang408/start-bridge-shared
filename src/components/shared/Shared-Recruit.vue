<template>
  <div class="form-group">
    <label class="fg-label">{{ label }}</label>

    <div class="checks">
      <label class="fg-label" v-if="type === 'recruit'">招聘管道:</label>

      <div
          class="option"
          v-for="opt in options"
          :key="opt.key"
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

        <!-- ✅ 編輯模式 -->
        <input
            v-if="opt.key === 'other' && model[opt.key]?.checked && !readonly"
            class="textInput"
            type="text"
            :value="model[opt.key]?.value || ''"
            @input="onInput(opt.key, $event.target.value)"
            placeholder="請輸入"
        />

        <!-- ✅ Readonly 模式 -->
        <input
            v-if="opt.key === 'other' && model[opt.key]?.checked && readonly"
            class="textInput"
            type="text"
            :value="model[opt.key]?.value || ''"
            readonly
            disabled
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
  readonly: { type: Boolean, default: false },
});

const uid = computed(() => `rc-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = { checked: false, value: "" };
}

function onToggle(key, checked) {
  if (props.readonly) return;

  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], checked } };
}

function onInput(key, val) {
  if (props.readonly) return;

  ensureKey(key);
  model.value = { ...model.value, [key]: { ...model.value[key], value: val } };
}
</script>

<style lang="scss" scoped>
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.fg-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 15px;
  color: #333;
}

.checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-wrap: nowrap;

  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    input[type="checkbox"] {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      cursor: pointer;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .option-label {
      flex: 0 1 auto; /* ✅ 可以縮小，不會無限擴大 */
      max-width: 500px; /* ✅ 最大寬度限制 */
      white-space: normal; /* ✅ 允許換行 */
      word-wrap: break-word; /* ✅ 長文字換行 */
      line-height: 1.5;
    }

    .textInput {
      padding: 8px 12px;
      margin-left: 8px;
      width: 350px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;

      @media (max-width: 768px) {
        width: 100%;
      }

      &:disabled,
      &[readonly] {
        background-color: #f8f9fa;
        color: #495057;
        cursor: default;
        border-color: #e9ecef;
        opacity: 1;
      }
    }
  }
}

.error-msg {
  color: #f44336;
  font-size: 14px;
  margin-top: 6px;
}
</style>
