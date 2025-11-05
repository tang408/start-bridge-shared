<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>

    <div class="pwd-wrap" :class="inputStateClass">
      <input
          :id="id"
          :type="showPassword ? 'text' : 'password'"
          v-model="model"
          :autocomplete="autocomplete"
          :required="required"
          @input="onInput"
          @blur="onBlur"
      />

      <!-- 密碼顯示/隱藏按鈕 -->
      <button
          v-if="type === 'password' && showEye"
          type="button"
          class="toggle-password"
          @click="togglePasswordVisibility"
          tabindex="-1"
          :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
      >
        <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20">
          <path
              fill="currentColor"
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20">
          <path
              fill="currentColor"
              d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
          />
        </svg>
      </button>

      <!-- 強度徽章 -->
      <div
          v-if="showStrength && basicOk && type === 'password'"
          class="badge"
          :class="badgeClass"
      >
        <svg viewBox="0 0 16 16" class="check" v-if="score >= 3">
          <path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1 5-5L13 5.1z"/>
        </svg>
        {{ strengthLabel }}
      </div>
    </div>

    <p
        v-if="type === 'password'"
        class="hint"
        :class="{ ok: basicOk }"
    >
      密碼長度至少為8個字元,使用數字、大小寫字母及符號(例如:# % $ @ …)
    </p>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import {computed, ref, watch} from "vue";

const model = defineModel({type: String, default: ""});

const props = defineProps({
  id: {type: String, required: true},
  label: {type: String, required: true},
  type: {type: String, default: "text"},
  autocomplete: {type: String, default: "new-password"},
  required: {type: Boolean, default: false},
  error: {type: String, default: ""},
  showStrength: {type: Boolean, default: true},
  minLength: {type: Number, default: 8},
  showEye: {type: Boolean, default: true},
});

const emit = defineEmits(["valid-change"]);

// 只保留一個控制變數
const showPassword = ref(false);

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

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

watch(basicOk, (v) => emit("valid-change", v), {immediate: true});
</script>

<style lang="scss" scoped>
.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
}

.pwd-wrap {
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding: 10px 45px 10px 12px; // 右側留空間給按鈕和徽章
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: #ff6634;
      box-shadow: 0 0 0 3px rgba(255, 102, 52, 0.1);
    }
  }

  &.is-invalid input {
    border-color: #db3838;
    padding-right: 12px; // 錯誤時不顯示徽章，減少右側空間
  }

  &.is-valid input {
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
    padding-right: 120px; // 有徽章時需要更多空間
  }

  .badge {
    position: absolute;
    right: 45px; // 留空間給眼睛按鈕
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    line-height: 16px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    pointer-events: none; // 避免阻擋點擊

    .check {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
  }

  .badge.weak {
    background: #fde8e8;
    color: #c53030;
  }

  .badge.mid {
    background: #fff3cd;
    color: #856404;
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
  line-height: 1.4;

  &.ok {
    color: #2c7a3f;
  }
}

.error-msg {
  margin-top: 6px;
  font-size: 13px;
  color: #db3838;
}

/* 密碼顯示/隱藏按鈕 */
.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: color 0.2s;
  z-index: 2;
  border-radius: 4px;

  &:hover {
    color: #ff6634;
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  svg {
    display: block;
  }
}
</style>
