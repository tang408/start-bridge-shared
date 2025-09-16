<template>
  <form class="form mt-4" @submit.prevent="submitStep">
    <div class="gap-2 d-grid">
      <h5 class="form-title">一、加點表單</h5>

      <!-- 是否有創業經驗 -->
      <SharedRadio
        v-model="local.hasStartupExp"
        label="是否有創業經驗？*"
        name="hasStartupExp"
        :options="[
          { text: '是', value: 'yes' },
          { text: '否', value: 'no' },
        ]"
        :error="errors.hasStartupExp"
      />

      <SharedTextarea
        id="expDesc"
        label="請簡述品牌、時間與經營成果"
        v-model="local.expDesc"
        :rows="4"
        placeholder="placeholder"
      />

      <!-- 是否有財務糾紛 -->
      <SharedRadio
        v-model="local.hasDispute"
        label="是否曾涉入財務糾紛、重大爭議或負面新聞？*"
        name="hasDispute"
        :options="[
          { text: '是', value: 'yes' },
          { text: '否', value: 'no' },
        ]"
        :error="errors.hasDispute"
      />

      <SharedTextarea
        id="disputeDesc"
        label="請說明"
        v-model="local.disputeDesc"
        :rows="4"
        placeholder="placeholder"
      />

      <!-- 願意提供佐證文件 -->
      <SharedRadio
        v-model="local.willingDocs"
        label="是否願意提供額外佐證文件？*"
        name="willingDocs"
        :options="[
          { text: '是', value: 'yes' },
          { text: '否', value: 'no' },
        ]"
        :error="errors.willingDocs"
      />

      <SharedTextarea
        id="selfAdv"
        label="自身優勢說明"
        v-model="local.selfAdv"
        :rows="4"
        placeholder="placeholder"
      />

      <SharedTextarea
        id="resources"
        label="具備資源"
        description="請簡述您具備哪些能力或資源，有助於創業成功？"
        v-model="local.resources"
        :rows="4"
        placeholder="placeholder"
      />

      <SharedTextarea
        id="otherResources"
        label="可動用資源"
        description="除自備款外，是否有人脈、技術、設備等可投入？"
        v-model="local.otherResources"
        :rows="4"
        placeholder="placeholder"
      />

      <!-- 願意提供佐證文件 (第二次) -->
      <SharedRadio
        v-model="local.willingDocs2"
        label="是否願意再提供其他佐證文件？"
        name="willingDocs2"
        :options="[
          { text: '是', value: 'yes' },
          { text: '否', value: 'no' },
        ]"
      />
    </div>

    <button type="submit" class="apply-btn write w-100 mt-4">下一步</button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive({ ...props.modelValue });

watch(local, (val) => emit("update:modelValue", val), { deep: true });

function submitStep() {
  props.errors.hasStartupExp = local.hasStartupExp
    ? ""
    : "請選擇是否有創業經驗";
  props.errors.hasDispute = local.hasDispute ? "" : "請選擇是否曾涉入";
  props.errors.willingDocs = local.willingDocs ? "" : "請選擇是否願意提供";

  if (
    !props.errors.hasStartupExp &&
    !props.errors.hasDispute &&
    !props.errors.willingDocs
  ) {
    emit("next", "step4");
  }
}
</script>

<style scoped>
.form-title {
  font-weight: 600;
  margin-bottom: 10px;
}
</style>
