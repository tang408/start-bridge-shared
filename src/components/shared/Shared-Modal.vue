<template>
  <div v-if="modelValue" class="modal-backdrop-content" @click.self="close">
    <div class="modal-content">
      <h3 v-if="title" class="modal-title">{{ title }}</h3>

      <div class="modal-body">
        <slot />
      </div>

      <div class="modal-footer">
        <template v-if="mode === 'confirm'">
          <button class="btn-confirm" @click="confirm">
            {{ confirmText }}
          </button>
        </template>

        <template v-else-if="mode === 'apply'">
          <button class="btn-apply w-45" @click="apply">報名</button>
          <button class="btn-cancel w-45" @click="close">關閉</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  confirmText: { type: String, default: "送出" },
  mode: { type: String, default: "confirm" },
});

const emit = defineEmits(["update:modelValue", "confirm", "apply"]);

function close() {
  emit("update:modelValue", false);
}

function confirm() {
  emit("confirm");
}

function apply() {
  emit("apply");
}
</script>

<style scoped lang="scss">
.modal-backdrop-content {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  padding: 25px;
}

.modal-content {
  border-radius: 20px;
  padding: 24px;
  max-width: 505px;
  width: 100%;
  background: #ffffffe6;
  box-shadow: 4px 4px 20px #0000000d;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.modal-body {
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* footer 分兩部分 */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;

  .footer-left,
  .footer-right {
    display: flex;
    gap: 12px;
  }

  .btn-apply {
    background: #ff6634;
    border: none;
    color: #fff;
    padding: 10px 28px;
    border-radius: 6px;
    cursor: pointer;
  }

  .btn-cancel {
    background: #eee;
    border: none;
    color: #333;
    padding: 10px 28px;
    border-radius: 6px;
    cursor: pointer;
  }
}
</style>
