<template>
  <div class="document">
    <div class="document-content">線上填寫或上傳文件擇一即可</div>

    <div class="d-flex flow-col gap-3 mt-4 w-100 justify-content-center">
      <!-- 線上填寫 -->
      <button type="button" class="document-btn write" @click="goNextStep">
        線上填寫
      </button>

      <!-- 下載填寫 -->
      <button
        type="button"
        class="document-btn dowload"
        @click="downloadTemplate"
      >
        下載填寫
      </button>

      <!-- 上傳檔案 -->
      <SharedUpload
        id="file"
        label="創業計劃書電子版上傳"
        v-model="local.file"
        :error="errors.file"
        accept=".jpg,.jpeg,.png,.gif,.pdf"
        :max-size="10 * 1024 * 1024"
        button-text="提交檔案"
        :name="'plan-document'"
        :max-size-mb="20"
        class="mt-3"
        @upload-success="(result) => handleUploadSuccess('plan-document', result)"
       account="startup-plan"
      />
    </div>

    <button type="button" class="apply-btn previous w-100 " @click="$emit('next', 'step1')">上一步</button>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "next", "createPlanByDocument"]);

const local = reactive({ ...props.modelValue });

watch(local, (val) => emit("update:modelValue", val), { deep: true });

function goNextStep() {
  emit("next", "step3");
}

function downloadTemplate() {
  window.open("http://43.213.118.243:8080/static/download_plan_document/plan-document.pdf", "_blank");
}

function handleUploadSuccess(fileType, result) {
  console.log(`${fileType} 上傳成功:`, result);

  const fileId = result.data?.id;
  const fileName = result.data?.displayName || result.data?.name;

  if (fileType === "plan-document") {
    local.file = {id: fileId, name: fileName};
  }
}

watch(
  () => local.file,
  (file) => {
    if (!file) {
      props.errors.file = "請選擇檔案";
      return;
    }
    props.errors.file = "";
    emit("createPlanByDocument", "step3");
  }
);
</script>

<style lang="scss" scoped>
.document {
  width: 500px;
  margin-top: 35px;
  @media (max-width: 576px) {
    width: 100%;
  }
}
.document-content {
  text-align: center;
  margin-bottom: 1rem;
}
</style>
