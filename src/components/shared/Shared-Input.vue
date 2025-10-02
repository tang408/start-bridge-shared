<template>
  <div class="form-group">
    <label v-if="label" :for="id">{{ label }}</label>

    <div class="row-inline" v-if="buttonText">
      <input
          :id="id"
          :type="type"
          v-model="model"
          :autocomplete="autocomplete"
          :required="required"
          :readonly="readonly"
          :class="{ 'is-invalid': error }"
          v-bind="$attrs"
      />
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
      <input
          :id="id"
          :type="type"
          v-model="model"
          :autocomplete="autocomplete"
          :required="required"
          :readonly="readonly"
          :class="{ 'is-invalid': error }"
          v-bind="$attrs"
      />
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

    <!-- 統一的 error 顯示位置 -->
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const model = defineModel({ type: [String, Number], default: "" });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  autocomplete: { type: String, default: "off" },
  required: { type: Boolean, default: false },
  error: { type: String, default: "" },
  buttonText: { type: String, default: "" },
  sent: { type: Boolean, default: false },
  countdown: { type: Number, default: 0 },
  resendText: { type: String, default: "重新寄送" },
  enableWhenFilled: { type: Boolean, default: false },
  pattern: { type: String, default: "" },
  enableIf: { type: Function, default: null },
  readonly: { type: Boolean, default: false },
  buttonReadonly: { type: Boolean, default: false },
});
const emit = defineEmits(["button-click", "resend"]);

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
      } catch (e) {}
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
.row-inline {
  display: flex;
  gap: 5px;
  button {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    width: 160px;
    height: 40px;
    background: #ff6634;
    border-radius: 8px;
    color: #fff;
    border: none;
    &:disabled {
      opacity: 0.7;
    }
  }
}

.link-like {
  border: none;
  background-color: transparent;
  color: #ff6634;
}
</style>
