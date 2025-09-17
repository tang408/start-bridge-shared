<template>
  <form class="form mt-4" @submit.prevent="submit">
    <SharedInput
      id="brand"
      label="品牌選擇"
      placeholder="品牌選擇"
      v-model="brandInfo"
      :error="props.errors.brand"
      readonly
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
      id="amountRange"
      label="額度級距(一單位多少)"
      type="number"
      v-model="local.amountRange"
      :error="props.errors.amountRange"
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
<!--    <SharedSelect-->
<!--      id="expireDate"-->
<!--      label="專案到期日"-->
<!--      v-model="local.expireDate"-->
<!--      :options="[-->
<!--        { value: '2025-09-05', text: '2025-09-05' },-->
<!--        { value: '2025-09-06', text: '2025-09-06' },-->
<!--      ]"-->
<!--      :error="props.errors.expireDate"-->
<!--    />-->
    <SharedDatePicker
        id="expireDate"
        label="專案到期日"
        v-model="local.expireDate"
        :error="props.errors.expireDate"
        :required="true"
    />
    <button type="button" class="apply-btn write w-100 mt-4" @click="submit">
      下一步：創業申請書
    </button>
  </form>
</template>

<script setup>
import {reactive, ref, watch} from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {useRoute} from "vue-router";
import {officialPartnerApi} from "@/api/modules/officialPartner.js";
import SharedDatePicker from "@/components/shared/Shared-DatePicker.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive({ ...props.modelValue });

watch(local, (val) => emit("update:modelValue", val), { deep: true });

// 如果 budget 跟 selfFund 有輸入，則計算 totalFunding
watch(
  () => [local.budget, local.selfFund],
  ([newBudget, newSelfFund]) => {
    const budgetNum = Number(newBudget) || 0;
    const selfFundNum = Number(newSelfFund) || 0;
    local.totalFunding = budgetNum - selfFundNum;
  }
);

// totalFunding 有值 partnerLimit 有值，計算 單筆最低額度
watch(
  () => [local.totalFunding, local.partnerLimit],
  ([newTotalFunding, newPartnerLimit]) => {
    const totalFundingNum = Number(newTotalFunding) || 0;
    const partnerLimitNum = Number(newPartnerLimit) || 1; // 避免除以零
    const minAmount = Math.floor(totalFundingNum / partnerLimitNum);
    local.minAmount = minAmount > 0 ? minAmount : 0;
  }
);

// minAmount 有值，暫定 amountRange = minAmount
watch(
  () => local.minAmount,
  (newMinAmount) => {
    const minAmountNum = Number(newMinAmount) || 0;
    local.amountRange = minAmountNum > 0 ? minAmountNum : 0;
  }
);

const router = useRoute();
if (router.query.brand) {
  local.brand = String(router.query.brand);
  getOfficialPartner();
}

const brandInfo = ref("");
async function getOfficialPartner() {
  const formData = {
    officialPartnerId: Number(local.brand),
  }
  const response = await officialPartnerApi.getOfficialPartner(formData)
  if (response && response.data) {
    brandInfo.value = `【${response.data.name}】 【加盟預算: $${response.data.franchiseFee}萬】`
  }
}
function submit() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));
  local.brand = Number(local.brand)
  if (!local.brand) props.errors.brand = "請選擇品牌";
  if (!local.budget) props.errors.budget = "請輸入創業預算";
  if (!local.selfFund) props.errors.selfFund = "請輸入自備款";
  if (!local.totalFunding) props.errors.totalFunding = "請輸入募資總額";
  if (!local.minAmount) props.errors.minAmount = "請輸入單筆最低額度";
  if (!local.amountRange) props.errors.maxAmount = "請輸入單筆最高額度";
  if (!local.partnerLimit) props.errors.partnerLimit = "請輸入夥伴人數上限";
  if (!local.expireDate) props.errors.expireDate = "請選擇專案到期日";

  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step2");
  }
}
</script>
