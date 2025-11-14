<template>
  <form class="form mt-4" @submit.prevent="submitStep">
    <div class="gap-2 d-grid">
      <!-- ✅ 只在 readonly 且非 PDF 預覽模式下顯示返回按鈕 -->
      <button
          v-if="readonly && showBackButton"
          type="button"
          class="btn-back mb-3"
          @click="$emit('back-to-list')"
      >
        ← 返回列表
      </button>

      <h5 class="form-title">一、加盟表單</h5>

      <!-- 是否有創業經驗 -->
      <SharedRadio
          id="hasStartupExp"
          v-model="local.hasStartupExp"
          label="是否有創業經驗？*"
          name="hasStartupExp"
          :options="[
          { text: '是', value: true },
          { text: '否', value: false },
        ]"
          :error="props.errors.hasStartupExp"
          :disabled="readonly"
      />

      <!-- ✅ 只在有創業經驗時顯示 -->
      <SharedTextarea
          v-if="local.hasStartupExp === true"
          id="expDesc"
          label="請簡述品牌、時間與經營成果"
          v-model="local.expDesc"
          :rows="4"
          placeholder="請簡述您的創業經驗"
          :readonly="readonly"
      />

      <!-- 是否有財務糾紛 -->
      <SharedRadio
          id="hasDispute"
          v-model="local.hasDispute"
          label="是否曾涉入財務糾紛、重大爭議或負面新聞？*"
          name="hasDispute"
          :options="[
          { text: '是', value: true },
          { text: '否', value: false },
        ]"
          :error="props.errors.hasDispute"
          :disabled="readonly"
      />

      <!-- ✅ 只在有財務糾紛時顯示 -->
      <SharedTextarea
          v-if="local.hasDispute === true"
          id="disputeDesc"
          label="請說明"
          v-model="local.disputeDesc"
          :rows="4"
          placeholder="請說明相關情況"
          :readonly="readonly"
      />

      <SharedTextarea
          id="selfAdv"
          label="自身優勢說明"
          description="請簡述您具備哪些能力或資源，有助於創業成功？"
          v-model="local.selfAdv"
          :rows="4"
          placeholder="請說明您的優勢"
          :readonly="readonly"
      />

      <SharedTextarea
          id="resources"
          label="具備資源"
          v-model="local.resources"
          :rows="4"
          placeholder="請說明您具備的資源"
          :readonly="readonly"
      />

      <SharedTextarea
          id="otherResources"
          label="可動用資源"
          description="除自備款外，是否有人脈、技術、設備等可投入？"
          v-model="local.otherResources"
          :rows="4"
          placeholder="請說明可動用的資源"
          :readonly="readonly"
      />

      <!-- 願意提供佐證文件 -->
      <SharedRadio
          v-model="local.willingDocs"
          label="是否願意提供額外佐證文件？*"
          name="willingDocs"
          :options="[
          { text: '是', value: true },
          { text: '否', value: false },
        ]"
          :error="props.errors.willingDocs"
          :disabled="readonly"
      />
    </div>

    <!-- ✅ 只在非 readonly 模式下顯示按鈕 -->
    <div v-if="!readonly">
      <button type="button" class="apply-btn previous w-100" @click="$emit('next', 'step2')">
        上一步
      </button>
      <button type="button" class="apply-btn write w-100 mt-4" @click="submitStep">
        下一步
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
  showBackButton: { type: Boolean, default: false }, // ✅ 新增 prop
});

const emit = defineEmits(["update:modelValue", "next", "back-to-list"]);

const local = reactive({ ...props.modelValue });

// ✅ 監聽 props.modelValue 的變化
watch(() => props.modelValue, (newVal) => {
  Object.assign(local, newVal);
}, { deep: true });

// ✅ 監聽 local 的變化
watch(local, (val) => {
  emit("update:modelValue", val);
}, { deep: true });

function scrollToError(fieldId) {
  const element = document.getElementById(fieldId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    element.classList.add('highlight-error');
    setTimeout(() => {
      element.classList.remove('highlight-error');
    }, 2000);
  }
}

function submitStep() {
  // 清空錯誤訊息
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  let firstErrorField = null;

  if (local.hasStartupExp === undefined || local.hasStartupExp === null || local.hasStartupExp === '') {
    if (!firstErrorField) firstErrorField = 'hasStartupExp'
    props.errors.hasStartupExp = "請選擇是否有創業經驗";
  } else if (local.hasStartupExp === true && (!local.expDesc || local.expDesc.trim() === '')) {
    if (!firstErrorField) firstErrorField = 'expDesc'
    props.errors.hasStartupExp = "請簡述創業經驗";
  }

  if (local.hasDispute === undefined || local.hasDispute === null || local.hasDispute === '') {
    if (!firstErrorField) firstErrorField = 'hasDispute'
    props.errors.hasDispute = "請選擇是否曾涉入財務糾紛";
  } else if (local.hasDispute === true && (!local.disputeDesc || local.disputeDesc.trim() === '')) {
    if (!firstErrorField) firstErrorField = 'disputeDesc'
    props.errors.hasDispute = "請說明財務糾紛";
  }

  if (local.willingDocs === undefined || local.willingDocs === null || local.willingDocs === '') {
    if (!firstErrorField) firstErrorField = 'willingDocs'
    props.errors.willingDocs = "請選擇是否願意提供佐證文件";
  }

  // 滾動到第一個錯誤
  if (firstErrorField) {
    scrollToError(firstErrorField);
  }

  // 檢查是否有錯誤
  const hasError = Object.values(props.errors).some((e) => e);

  if (!hasError) {
    emit("next", "step4");
  }
}
</script>

<style scoped>
.btn-back {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    border-color: #999;
  }
}

.form-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

/* ✅ 新增：高亮錯誤的樣式 */
:deep(.highlight-error) {
  animation: highlight 0.5s ease-in-out;
}

@keyframes highlight {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: #fff3cd;
  }
}
</style>
