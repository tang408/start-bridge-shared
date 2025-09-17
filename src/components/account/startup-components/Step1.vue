<template>
  <form class="form mt-4" @submit.prevent="submit">
    <SharedSelect
      id="brand"
      label="品牌選擇"
      placeholder="品牌選擇"
      v-model="local.brand"
      :options="[
        { value: 'A', text: 'A' },
        { value: 'B', text: 'B' },
      ]"
      :error="props.errors.brand"
    />
    <!-- 創業預算 -->
    <SharedInput
      id="budget"
      v-model="local.budget"
      label="創業預算"
      type="number"
      :error="props.errors.budget"
    />

    <!-- 創業者自備款 -->
    <SharedInput
      id="selfFund"
      v-model="local.selfFund"
      label="創業者自備款"
      type="number"
      :error="props.errors.selfFund"
    />

    <!-- 募資總額 -->
    <SharedInput
      id="totalFunding"
      v-model="local.totalFunding"
      label="募資總額"
      type="number"
      :error="props.errors.totalFunding"
    />

    <!-- 單筆最低金額度 -->
    <SharedInput
      id="minAmount"
      label="單筆最低額度"
      type="number"
      v-model="local.minAmount"
      :error="props.errors.minAmount"
    />

    <!-- 單筆最高金額度 -->
    <SharedInput
      id="maxAmount"
      label="單筆最高額度"
      type="number"
      v-model="local.maxAmount"
      :error="props.errors.maxAmount"
    />

    <!-- 夥伴人數上限 -->
    <SharedInput
      id="partnerLimit"
      label="夥伴人數上限"
      type="number"
      v-model="local.partnerLimit"
      :error="props.errors.partnerLimit"
    />

    <!-- 專案到期日 -->
    <SharedSelect
      id="expireDate"
      label="專案到期日"
      v-model="local.expireDate"
      :options="[
        { value: '2025-09-05', text: '2025-09-05' },
        { value: '2025-09-06', text: '2025-09-06' },
      ]"
      :error="props.errors.expireDate"
    />
    <button type="submit" class="apply-btn write w-100 mt-4">
      下一步：創業申請書
    </button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive({ ...props.modelValue });

watch(local, (val) => emit("update:modelValue", val), { deep: true });

function submit() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  if (!local.brand) props.errors.brand = "請選擇品牌";
  if (!local.budget) props.errors.budget = "請輸入創業預算";
  if (!local.selfFund) props.errors.selfFund = "請輸入自備款";
  if (!local.totalFunding) props.errors.totalFunding = "請輸入募資總額";
  if (!local.minAmount) props.errors.minAmount = "請輸入單筆最低額度";
  if (!local.maxAmount) props.errors.maxAmount = "請輸入單筆最高額度";
  if (!local.partnerLimit) props.errors.partnerLimit = "請輸入夥伴人數上限";
  if (!local.expireDate) props.errors.expireDate = "請選擇專案到期日";

  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step2");
  }
}
</script>
