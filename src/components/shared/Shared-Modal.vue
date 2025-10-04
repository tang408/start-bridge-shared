<template>
  <div v-if="modelValue" class="modal-backdrop-content" @click.self="close">
    <div class="modal-content">
      <h3 v-if="title" class="modal-title" :class="`align-${titleAlign}`">
        {{ title }}
      </h3>

      <div class="modal-body">
        <slot />
      </div>

      <div class="modal-footer">
        <template v-if="mode === 'confirm'">
          <button class="btn-orange w-45" @click="confirm">修改</button>
          <button class="btn-gray w-45" @click="close">關閉</button>
        </template>

        <template v-else-if="mode === 'apply'">
          <button class="btn-orange w-45" @click="apply">報名</button>
          <button class="btn-gray w-45" @click="close">關閉</button>
        </template>

        <template v-else-if="mode === 'project'">
          <button class="btn-orange w-45" @click="manage">管理專案</button>
          <button class="btn-yellow w-45" @click="close">離開</button>
        </template>

        <template v-else-if="mode === 'member'">
          <button class="btn-orange w-45" @click="save">儲存</button>
          <button class="btn-yellow w-45" @click="close">關閉</button>
        </template>

        <template v-else-if="mode === 'close'">
          <button class="btn-yellow w-45" @click="close">關閉</button>
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
  titleAlign: { type: String, default: "left" },
});

const emit = defineEmits([
  "update:modelValue",
  "confirm",
  "apply",
  "manage",
  "save",
]);

function close() {
  emit("update:modelValue", false);
}

function confirm() {
  emit("confirm");
}

function apply() {
  emit("apply");
}

function manage() {
  emit("manage");
}

function save() {
  emit("save");
}
</script>

<style scoped lang="scss">
.modal-backdrop-content {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  padding: 25px;
  min-width: 500px;
  @media (max-width: 576px) {
    min-width: auto;
    position: absolute;
    padding: 0;
    overflow-y: auto;
  }
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
  &.align-left {
    text-align: left;
  }
  &.align-center {
    text-align: center;
  }
}

.modal-body {
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;

  .footer-left,
  .footer-right {
    display: flex;
    gap: 12px;
  }

  button {
    padding: 10px 28px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    @media (max-width: 576px) {
      padding: 10px;
    }
  }

  .btn {
    &-orange {
      background: $btn-orange;
      color: $white;
    }

    &-gray {
      background: $brand-gray;
      color: $text-dark;
    }

    &-yellow {
      background: #ffcc66;
      color: #373a36;
    }
  }
}
</style>
