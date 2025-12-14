<template>
  <div class="form-group">
    <label v-if="label" :for="id">{{ label }}</label>

    <div class="row-inline" v-if="buttonText">
      <div class="input-wrapper-with-eye">
        <input
            :id="id"
            :type="computedType"
            :value="displayValue"
            @input="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            :required="required"
            :readonly="readonly"
            :class="{ 'is-invalid': error }"
            v-bind="$attrs"
        />
        <!-- 密碼顯示/隱藏按鈕 -->
        <button
            v-if="type === 'password' && showEye"
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
            tabindex="-1"
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
        <button
            v-if="type === 'profile-password'"
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
            tabindex="-1"
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
      </div>
      <button
          type="button"
          class="btn-secondary"
          :disabled="!canClick"
          :aria-disabled="!canClick"
          @click="onButtonClick"
      >
        {{ buttonText }}
      </button>
    </div>

    <template v-else>
      <div class="input-wrapper-with-eye">
        <input
            :id="id"
            :type="computedType"
            :value="displayValue"
            @input="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            :required="required"
            :readonly="readonly"
            :class="{ 'is-invalid': error }"
            v-bind="$attrs"
        />
        <!-- 密碼顯示/隱藏按鈕 -->
        <button
            v-if="type === 'password' && showEye"
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
            tabindex="-1"
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
      </div>
    </template>

    <!-- OTP 提示 -->
    <p v-if="sent" class="otp-hint">
      已寄出驗證碼，沒有收到？
      <button
          type="button"
          class="link-like"
          :disabled="countdown > 0"
          @click="$emit('resend')"
      >
        {{ resendText }}
      </button>
      <span v-if="countdown > 0">{{ countdown }}s</span>
    </p>

    <!-- 提示文字 -->
    <p v-if="hint && !error" class="hint-msg">{{ hint }}</p>

    <!-- 統一的 error 顯示位置 -->
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

defineOptions({ inheritAttrs: false });

const model = defineModel({ type: [String, Number], default: "" });

const props = defineProps({
  id: {type: String, required: true},
  label: {type: String, default: ""},
  type: {type: String, default: "text"},
  placeholder: {type: String, default: ""},
  autocomplete: {type: String, default: "off"},
  required: {type: Boolean, default: false},
  error: {type: String, default: ""},
  hint: {type: String, default: ""}, // 新增：提示文字
  buttonText: {type: String, default: ""},
  sent: {type: Boolean, default: false},
  countdown: {type: Number, default: 0},
  resendText: {type: String, default: "重新寄送"},
  enableWhenFilled: {type: Boolean, default: false},
  pattern: {type: String, default: ""},
  enableIf: {type: Function, default: null},
  readonly: {type: Boolean, default: false},
  buttonReadonly: {type: Boolean, default: false},
  showEye: {type: Boolean, default: true},
  formatNumber: {type: Boolean, default: false}, // 新增：是否格式化為千分位
});

const emit = defineEmits(["button-click", "resend"]);

const showPassword = ref(false);
const isFocused = ref(false);

const computedType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text';
  }
  return props.type;
});

// 顯示值：輸入時顯示原始值，失焦時顯示格式化值
const displayValue = computed(() => {
  if (!props.formatNumber) {
    return model.value;
  }

  // 正在輸入時，不格式化
  if (isFocused.value) {
    return model.value;
  }

  // 失焦時格式化顯示
  if (!model.value && model.value !== 0) return '';
  return formatNumberWithCommas(model.value);
});

// 格式化數字為千分位
function formatNumberWithCommas(value) {
  if (!value && value !== 0) return '';
  const numStr = value.toString().replace(/,/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 處理輸入
function handleInput(event) {
  let value = event.target.value;

  if (props.formatNumber) {
    // 移除所有逗號，只保留數字
    value = value.replace(/,/g, '');
    // 只允許數字
    value = value.replace(/[^\d]/g, '');
    model.value = value ? parseInt(value, 10) : '';
  } else {
    model.value = value;
  }
}

// 失焦時格式化
function handleBlur(event) {
  isFocused.value = false;

  if (props.formatNumber && model.value) {
    // 觸發重新渲染以顯示格式化後的值
    event.target.value = formatNumberWithCommas(model.value);
  }
}

// 聚焦時取消格式化
function handleFocus(event) {
  isFocused.value = true;

  if (props.formatNumber && model.value) {
    // 顯示原始數字，方便編輯
    event.target.value = model.value.toString();
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const canClick = computed(() => {
  if (props.buttonReadonly) return false;
  if (!props.buttonText) return true;
  const val = String(model.value ?? "").trim();
  if (props.enableIf) return !!props.enableIf(val);

  if (props.enableWhenFilled) {
    const val = String(model.value ?? "").trim();
    if (!val) return false;

    if (props.pattern) {
      try {
        const re = new RegExp(props.pattern);
        if (!re.test(val)) return false;
      } catch (e) {
      }
    }
  }
  return true;
});

function onButtonClick() {
  if (!canClick.value) return;
  emit("button-click");
}
</script>

<style lang="scss" scoped>
/* input 包裹容器 */
.input-wrapper-with-eye {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

/* 當是密碼輸入框時，給右側留出空間 */
.input-wrapper-with-eye input[type="password"],
.input-wrapper-with-eye input[type="text"] {
  padding-right: 40px;
}

/* 密碼顯示/隱藏按鈕 */
.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: color 0.2s;
  z-index: 1;
}

.toggle-password:hover {
  color: #ff6634;
}

.toggle-password:focus {
  outline: none;
}

.toggle-password svg {
  display: block;
}

.row-inline {
  display: flex;
  gap: 5px;

  button.btn-secondary {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    width: 160px;
    height: 40px;
    background: #ff6634;
    border-radius: 8px;
    color: #fff;
    border: none;
    flex-shrink: 0;

    &:disabled {
      opacity: 0.7;
    }
  }
}

.link-like {
  border: none;
  background-color: transparent;
  color: #ff6634;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.hint-msg {
  color: #909399;
  font-size: 13px;
  margin-top: 4px;
  margin-bottom: 0;
  line-height: 1.4;
}
</style>
