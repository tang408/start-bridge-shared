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

    <!-- 預計總費用 -->
    <SharedInput
        id="budget"
        v-model="local.budget"
        label="預計總費用(元)"
        type="number"
        :error="props.errors.budget"
        :readonly="readonly"
    />

    <!-- 創業者自備款 -->
    <SharedInput
        id="selfFund"
        v-model="local.selfFund"
        label="創業者自備款(元)"
        type="number"
        :error="props.errors.selfFund"
        :readonly="readonly"
    />

    <!-- 募資總額 -->
    <SharedInput
        id="totalFunding"
        v-model="local.totalFunding"
        label="募資總額(元)"
        type="number"
        :error="props.errors.totalFunding"
        readonly
    />

    <!-- 單筆最低金額度 -->
    <SharedInput
        id="minAmount"
        label="單筆最低額度(元)"
        type="number"
        v-model="local.minAmount"
        :error="props.errors.minAmount"
        :readonly="readonly"
    />

    <!-- 單筆最高金額度 -->
    <SharedInput
        id="amountRange"
        label="額度級距(元) (一單位多少)"
        type="number"
        v-model="local.amountRange"
        :error="props.errors.amountRange"
        readonly
    />

    <!-- 預計開業區域/坪數/店面狀況 -->
    <SharedInput
        id="minAmount"
        label="預計開業區域/坪數/店面狀況"
        type="text"
        v-model="local.expectedOpeningInfo"
        :error="props.errors.expectedOpeningInfo"
        :readonly="readonly"
    />

    <!-- 預計開業時間 -->
    <SharedInput
        id="minAmount"
        label="預計開業時間"
        type="text"
        v-model="local.expectedOpeningDate"
        :error="props.errors.expectedOpeningDate"
        :readonly="readonly"
    />

    <!-- 夥伴人數上限 -->
    <SharedInput
        id="partnerLimit"
        label="夥伴人數上限"
        type="number"
        v-model="local.partnerLimit"
        :error="props.errors.partnerLimit"
        readonly
    />
  </form>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedDatePicker from "@/components/shared/Shared-DatePicker.vue";
import { officialPartnerApi } from "@/api/modules/officialPartner.js";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "next"]);

const route = useRoute();
const router = useRouter();
const local = reactive({ ...props.modelValue });
const brandInfo = ref("");

watch(local, (val) => emit("update:modelValue", val), { deep: true });

// 計算募資總額
watch(
    () => [local.budget, local.selfFund],
    ([newBudget, newSelfFund]) => {
      const budgetNum = Number(newBudget) || 0;
      const selfFundNum = Number(newSelfFund) || 0;
      local.totalFunding = budgetNum - selfFundNum;
    }
);

watch(
    () => [local.totalFunding, local.minAmount] ,
    ([newTotalFunding, newMinAmount]) => {
      const totalFundingNum = Number(newTotalFunding) || 0;
      const minAmountNum = Number(newMinAmount) || 1;
      local.partnerLimit = Math.ceil(totalFundingNum / minAmountNum);
    }
)

// 返回列表
function backToList() {
  router.push({
    path: '/account/startup',
    query: { source: 'account' }
  });
}

// 載入品牌資訊
async function getOfficialPartner() {
  if (!local.brand) return;

  const formData = {
    officialPartnerId: Number(local.brand),
  };

  try {
    const response = await officialPartnerApi.getOfficialPartner(formData);
    if (response && response.data) {
      brandInfo.value = `【${response.data.name}】 【加盟預算: $${fmtMoney(response.data.franchiseFee)}】`;
    }
  } catch (error) {
    console.error('載入品牌資訊失敗:', error);
  }
}

function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString("zh-Hant-TW");
}

// 初始化
onMounted(() => {
  // 從路由獲取 brand (創建模式)
  if (route.query.brand) {
    local.brand = String(route.query.brand);
  }

  // 如果有 brand,載入品牌資訊
  if (local.brand) {
    getOfficialPartner();
  }
});

// 監聽 modelValue 變化,用於預覽模式載入資料
watch(
    () => props.modelValue.brand,
    (newBrand) => {
      if (newBrand) {
        local.brand = newBrand;
        getOfficialPartner();
      }
    },
    { immediate: true }
);
</script>

<style lang="scss">
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

.button-group {
  display: flex;
  gap: 12px;

  @media (max-width: 576px) {
    flex-direction: column;
  }
}
</style>
