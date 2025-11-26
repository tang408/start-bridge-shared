<template>
  <form class="form mt-4" @submit.prevent="submit">
    <!-- 如果是預覽模式,顯示返回按鈕 -->
    <button
        v-if="readonly"
        type="button"
        class="btn-back mb-3"
        @click="backToList"
    >
      ← 返回列表
    </button>

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
        label="預計總費用(萬元)"
        type="number"
        :error="props.errors.budget"
        :readonly="readonly"
    />

    <!-- 創業者自備款 -->
    <SharedInput
        id="selfFund"
        v-model="local.selfFund"
        label="創業者自備款(萬元)"
        type="number"
        :error="props.errors.selfFund"
        :readonly="readonly"
    />

    <!-- 募資總額 -->
    <SharedInput
        id="totalFunding"
        v-model="local.totalFunding"
        label="募資總額(萬元)"
        type="number"
        :error="props.errors.totalFunding"
        readonly
    />

    <!-- 單筆最低金額度 -->
    <SharedInput
        id="minAmount"
        label="單筆最低額度(萬元)"
        type="number"
        v-model="local.minAmount"
        :error="props.errors.minAmount"
        :readonly="readonly"
    />

    <!-- 額度級距 -->
    <SharedInput
        id="amountRange"
        label="額度級距(萬元) (一單位多少)"
        type="number"
        v-model="local.amountRange"
        :error="props.errors.amountRange"
        readonly
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

    <!-- 按鈕區塊 -->
    <div class="button-group mt-4">
      <!-- 預覽模式:跳到 step3 -->
      <template v-if="readonly">
        <button type="button" class="apply-btn write w-100" @click="goToNextStep">
          下一步:創業經驗
        </button>
      </template>

      <!-- 編輯模式:驗證後到 step2 -->
      <template v-else>
        <button type="button" class="apply-btn write w-100" @click="submit">
          下一步:創業申請書
        </button>
      </template>
    </div>
  </form>
</template>

<script setup>
import {reactive, ref, watch, onMounted, nextTick} from "vue";
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

// 計算最低額度是否整除總額 同步到 額度級距
let isAdjustingMinAmount = false;

watch(
    () => local.minAmount,
    (newMinAmount) => {
      // 防止循環調整
      if (isAdjustingMinAmount) return;

      const minAmountNum = Number(newMinAmount) || 1;
      const totalFundingNum = Number(local.totalFunding) || 0;

      if (minAmountNum > 0 && totalFundingNum > 0) {
        // 找出能整除 totalFunding 的最接近值
        const factors = [];

        // 找出所有因數
        for (let i = 1; i <= totalFundingNum; i++) {
          if (totalFundingNum % i === 0) {
            factors.push(i);
          }
        }

        // 找最接近 minAmountNum 的因數
        let closestFactor = factors[0];
        let minDiff = Math.abs(minAmountNum - closestFactor);

        for (const factor of factors) {
          const diff = Math.abs(minAmountNum - factor);
          if (diff < minDiff) {
            minDiff = diff;
            closestFactor = factor;
          }
        }

        if (closestFactor !== minAmountNum) {
          isAdjustingMinAmount = true;
          nextTick(() => {
            local.minAmount = closestFactor;
            local.amountRange = closestFactor;
            isAdjustingMinAmount = false;
          });
        } else {
          local.amountRange = minAmountNum;
        }
      } else {
        local.amountRange = minAmountNum;
      }
    }
);

// 計算合夥人上限（放在最後，確保使用已調整的值）
watch(
    () => [local.totalFunding, local.minAmount],
    ([newTotalFunding, newMinAmount]) => {
      const totalFundingNum = Number(newTotalFunding) || 0;
      const minAmountNum = Number(newMinAmount) || 1;

      if (minAmountNum > 0) {
        local.partnerLimit = Math.ceil(totalFundingNum / minAmountNum);
      }
    }
);

// 返回列表
function backToList() {
  router.push({
    path: '/account/startup',
    query: { source: 'account' }
  });
}

// 預覽模式:跳過 step2,直接到 step3
function goToNextStep() {
  emit("next", "step3");
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
      brandInfo.value = `【${response.data.name}】 【加盟預算: $${response.data.franchiseFee}】`;
    }
  } catch (error) {
    console.error('載入品牌資訊失敗:', error);
  }
}

// 編輯模式:提交表單並驗證
function submit() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  local.brand = Number(local.brand);

  if (!local.brand) props.errors.brand = "請選擇品牌";
  if (!local.budget) props.errors.budget = "請輸入創業預算";
  if (!local.selfFund) props.errors.selfFund = "請輸入自備款";
  if (!local.totalFunding) props.errors.totalFunding = "請輸入募資總額";
  if (!local.minAmount) props.errors.minAmount = "請輸入單筆最低額度";
  if (!local.amountRange) props.errors.amountRange = "請輸入額度級距";
  if (!local.partnerLimit) props.errors.partnerLimit = "請輸入夥伴人數上限";


  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step2");
  }
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

<style scoped lang="scss">
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
