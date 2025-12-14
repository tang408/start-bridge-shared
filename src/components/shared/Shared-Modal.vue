<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="close">
    <div class="modal-backdrop-content">
      <div class="modal-content" :class="{ 'has-image': hasImage, 'modal-large': large }">
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
            <button
                class="btn-orange w-45"
                @click="apply"
                :disabled="disableApply"
                :class="{ 'btn-disabled': disableApply }"
            >
              {{ applyText }}
            </button>
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

          <template v-else-if="mode === 'submit'">
            <button class="btn-orange w-45" @click="submit">送出</button>
            <button class="btn-yellow w-45" @click="close">關閉</button>
          </template>

          <template v-else-if="mode === 'close'">
            <button class="btn-yellow w-45" @click="close">關閉</button>
          </template>

          <template v-else-if="mode === 'long'">
            <button class="btn-orange w-45" @click="confirm">確定</button>
            <button class="btn-gray w-45" @click="close">取消</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  confirmText: { type: String, default: "送出" },
  mode: { type: String, default: "confirm" },
  titleAlign: { type: String, default: "left" },
  large: { type: Boolean, default: false },
  applyText: { type: String, default: "報名" }, // 🆕 報名按鈕文字
  disableApply: { type: Boolean, default: false }, // 🆕 是否禁用報名按鈕
});

const emit = defineEmits([
  "update:modelValue",
  "confirm",
  "apply",
  "manage",
  "save",
  "submit",
]);

const slots = useSlots()

// 檢查是否包含圖片
const hasImage = computed(() => {
  return slots.default?.().some(vnode =>
      vnode.type === 'img' ||
      (vnode.children && typeof vnode.children === 'string' && vnode.children.includes('<img'))
  )
})

function close() {
  emit("update:modelValue", false);
}

function confirm() {
  emit("confirm");
}

function apply() {
  // 🆕 如果按鈕被禁用，不觸發事件
  if (props.disableApply) {
    return;
  }
  emit("apply");
}

function manage() {
  emit("manage");
}

function save() {
  emit("save");
}

function submit() {
  emit("submit");
}
</script>

<style scoped lang="scss">
// 🆕 遮罩層
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9997;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 20px;

  @media (max-width: 576px) {
    padding: 10px;
  }
}

// 🆕 容器 - 負責居中和滾動
.modal-backdrop-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

// Modal 主體
.modal-content {
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 505px;
  background: #ffffffe6;
  box-shadow: 4px 4px 20px #0000000d;
  position: relative;

  // 🆕 確保內容不會溢出
  max-height: calc(100vh - 40px);
  overflow-y: auto;

  // 🆕 響應式寬度
  @media (max-width: 768px) {
    max-width: 90vw;
    padding: 20px;
  }

  @media (max-width: 576px) {
    max-width: 95vw;
    padding: 16px;
    border-radius: 16px;
  }

  // 包含圖片時的樣式
  &.has-image {
    max-width: 90vw;
    max-height: 90vh;

    @media (max-width: 768px) {
      max-width: 95vw;
    }
  }

  // 大尺寸模式
  &.modal-large {
    max-width: 800px;

    @media (max-width: 992px) {
      max-width: 90vw;
    }

    @media (max-width: 576px) {
      max-width: 95vw;
    }
  }
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;

  @media (max-width: 576px) {
    font-size: 16px;
    margin-bottom: 10px;
  }

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

  // 🆕 確保長文字可以換行
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 576px) {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .doc-image {
    width: 100%;
    height: auto;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 8px;
    display: block;
    margin: 0 auto;
  }

  // 🆕 處理 slot 中的圖片
  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    gap: 12px;
  }

  .footer-left,
  .footer-right {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  button {
    padding: 10px 28px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    font-size: 14px;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      opacity: 0.8;
    }

    // 🆕 禁用狀態
    &:disabled,
    &.btn-disabled {
      cursor: not-allowed;
      opacity: 0.5;

      &:hover {
        opacity: 0.5;
      }
    }

    @media (max-width: 576px) {
      padding: 10px 20px;
      font-size: 13px;
      flex: 1;
      min-width: 100px;
    }

    @media (max-width: 400px) {
      padding: 8px 16px;
      font-size: 12px;
    }
  }

  // 🆕 按鈕寬度處理
  .w-45 {
    width: 45%;

    @media (max-width: 576px) {
      width: calc(50% - 6px);
    }

    @media (max-width: 400px) {
      width: 100%;
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

// 🆕 自定義滾動條樣式（可選）
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
