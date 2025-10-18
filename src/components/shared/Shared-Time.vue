<template>
  <div class="form-group">
    <label class="fg-label">{{ label }}</label>

    <div class="checks">
      <div
          class="option"
          :class="{ 'has-text-input': opt.key === 'other' }"
          v-for="opt in options"
          :key="opt.key"
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

        <div v-if="opt.withTime" class="time-inputs">
          <span>預計在店裡時間：</span>
          <input
              class="textline"
              type="number"
              min="0"
              :value="model[opt.key]?.from || ''"
              :disabled="!model[opt.key]?.checked"
              @input="onInput(opt.key, 'from', $event.target.value)"
          />
          <span>點至</span>
          <input
              class="textline"
              type="number"
              min="0"
              :value="model[opt.key]?.to || ''"
              :disabled="!model[opt.key]?.checked"
              @input="onInput(opt.key, 'to', $event.target.value)"
          />
          <span>點</span>
        </div>

        <!-- 其他 -->
        <template v-if="opt.key === 'other'">
          <input
              class="textline text-input"
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
import {computed} from "vue";

defineOptions({name: "SharedInvestTimePlan"});

const model = defineModel({type: Object, default: () => ({})});

const props = defineProps({
  label: {type: String, default: ""},
  options: {type: Array, default: () => []},
  error: {type: String, default: ""},
});

const uid = computed(() => `tp-${Math.random().toString(36).slice(2, 9)}`);

function ensureKey(key) {
  if (!model.value[key]) model.value[key] = {checked: false};
}

function onToggle(key, checked) {
  const newModel = {};
  for (const k of Object.keys(model.value)) {
    newModel[k] = {...model.value[k], checked: false};
  }
  if (checked) {
    newModel[key] = {...newModel[key], checked: true};
  }

  model.value = newModel;
}

function onInput(key, field, val) {
  ensureKey(key);
  model.value = {
    ...model.value,
    [key]: {...model.value[key], [field]: val},
  };
}
</script>

<style scoped lang="scss">
.checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  /* 有 text input 的選項延伸到最右邊 */
  &.has-text-input {
    .text-input {
      flex: 1;
      min-width: 0;
      max-width: none;
    }
  }

  input[type="checkbox"] {
    flex-shrink: 0;
  }

  .option-label {
    flex-shrink: 0;
    white-space: nowrap;
  }
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  span {
    white-space: nowrap;
  }
}

.textline {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
}

/* number 類型固定寬度 */
input[type="number"].textline {
  width: 80px;
  text-align: right;
}

/* text 類型預設寬度 */
input[type="text"].textline {
  min-width: 200px;
}

/* text-input class 會被 has-text-input 覆蓋延伸 */
.text-input {
  /* 這個會被父層的 flex: 1 覆蓋 */
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
