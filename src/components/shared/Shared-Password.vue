<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>

    <div class="pwd-wrap" :class="inputStateClass">
      <input
        :id="id"
        :type="show ? 'text' : 'password'"
        v-model="model"
        :autocomplete="autocomplete"
        :required="required"
        @input="onInput"
        @blur="onBlur"
      />

      <!-- 強度徽章 -->
      <div v-if="showStrength && basicOk" class="badge" :class="badgeClass">
        <svg viewBox="0 0 16 16" class="check" v-if="score >= 3">
          <path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1 5-5L13 5.1z" />
        </svg>
        {{ strengthLabel }}
      </div>
    </div>

    <p class="hint" :class="{ ok: basicOk }">
      密碼長度至少為8個字元，使用數字、大小寫字母及符號(例如：# % $ @ …)
    </p>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const model = defineModel({ type: String, default: "" });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  autocomplete: { type: String, default: "new-password" },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  showStrength: { type: Boolean, default: true },
  minLength: { type: Number, default: 8 },
});

const emit = defineEmits(["valid-change"]);

const show = ref(false);

const hasLower = computed(() => /[a-z]/.test(model.value));
const hasUpper = computed(() => /[A-Z]/.test(model.value));
const hasNumber = computed(() => /\d/.test(model.value));
const hasSymbol = computed(() => /[^A-Za-z0-9]/.test(model.value));
const hasLen = computed(() => (model.value?.length || 0) >= props.minLength);

const categoryCount = computed(
  () =>
    [hasLower.value, hasUpper.value, hasNumber.value, hasSymbol.value].filter(
      Boolean
    ).length
);
const basicOk = computed(() => hasLen.value && categoryCount.value >= 3);

const score = computed(() => {
  let s = 0;
  if (hasLen.value) s++;
  if (categoryCount.value >= 2) s++;
  if (categoryCount.value >= 3) s++;
  if (categoryCount.value === 4 && model.value.length >= 12) s++;
  return s;
});

const strengthLabel = computed(() => {
  if (!props.showStrength || !basicOk.value) return "";
  if (score.value <= 1) return "強度較弱";
  if (score.value === 2) return "強度中等";
  if (score.value === 3) return "強度良好";
  return "強度很強";
});

const inputStateClass = computed(() => ({
  "is-invalid": !!props.error,
  "is-valid": basicOk.value && !props.error,
}));

const badgeClass = computed(() => {
  return {
    weak: score.value <= 1,
    mid: score.value === 2,
    good: score.value === 3,
    great: score.value >= 4,
  };
});

function onInput() {
  emit("valid-change", basicOk.value);
}
function onBlur() {
  emit("valid-change", basicOk.value);
}

watch(basicOk, (v) => emit("valid-change", v), { immediate: true });
</script>

<style lang="scss" scoped>
.pwd-wrap {
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  &.is-invalid input {
    border-color: #db3838;
  }
  &.is-valid input {
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
  }

  .eye-btn {
    position: absolute;
    right: 12px;
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    svg {
      fill: #777;
    }
  }

  .badge {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    padding: 2px 8px;
    border-radius: 50%;
    font-size: 12px;
    line-height: 18px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    .check {
      width: 14px;
      height: 14px;
      fill: #2c7a3f;
    }
  }

  .badge.weak {
    background: #fde8e8;
    color: #c53030;
  }
  .badge.mid {
    background: #e6f4ea;
    color: #2c7a3f;
  }
  .badge.good {
    background: #d9f2e1;
    color: #257a3f;
  }
  .badge.great {
    background: #c8edd6;
    color: #1f6e36;
  }
}

.hint {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
  &.ok {
    color: #2c7a3f;
  }
}
</style>
