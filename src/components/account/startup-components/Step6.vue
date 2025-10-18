<template>
  <div class="form-wrapper">
    <form class="form-card" @submit.prevent="submitStep">
      <h5 class="form-title">創業計劃書</h5>

      <div class="content">
        <h6 class="section-title">四、創業責任與分潤條款</h6>
        <p class="desc">※ 審核通過後，本計劃書將成為合約附件</p>
        <p class="desc">
          回報機制 (單選，請依實際營運現況評估填寫)
          <br />
          媒合成功後，請選擇您預計給予【共同創業者】的分潤方式
        </p>

        <div class="form-sections">
          <SharedRadio
              v-model="local.sharePeriod"
              label="【分潤週期】"
              name="sharePeriod"
              :options="[
              { value: 'monthly', text: '每月結算並分潤一次(每一個月)' },
              { value: 'quarterly', text: '每季結算並分潤一次(每三個月)' },
              { value: 'halfyear', text: '每半年結算並分潤一次(每六個月)' },
              { value: 'yearly', text: '每年結算並分潤一次(每十二個月)' },
            ]"
              :error="errors.sharePeriod"
          />

          <SharedRadio
              v-model="local.shareCalc"
              v-model:extra="local.shareCalcOther"
              label="【分潤計算方式】"
              desc="※ 分潤金額將以「扣除應提成本」後之「稅後淨利」為依據，進行計算。"
              name="shareCalc"
              :options="[
              {
                value: 'agree',
                text: '同意依照【共同創業者】出資占比計算淨利分潤(例如:出資 20 萬/總投資 100 萬 = 分潤 20%)',
              },
              { value: 'other', text: '其他', withInput: true },
            ]"
              :error="errors.shareCalc"
          />

          <SharedRadio
              v-model="local.sharePay"
              v-model:extra="local.sharePayOther"
              label="【分潤支付方式】"
              desc="※ 「星橋創媒」平台僅提供雙方建議,不代為分配款項、無管理責任，創業者需負責發放給【共同創業者】。"
              name="sharePay"
              :options="[
              { value: 'bank', text: '銀行匯款至指定帳戶(需提供匯款憑證備查)' },
              { value: 'other', text: '其他', withInput: true },
            ]"
              :error="errors.sharePay"
          />

          <p class="note">※ 以上皆須在「公司章程」中載明</p>
        </div>
      </div>

      <button type="button" class="btn-submit" @click="submitStep">
        下一頁
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive({ ...props.modelValue });

watch(local, (val) => emit("update:modelValue", val), { deep: true });

function submitStep() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  if (!local.sharePeriod) {
    props.errors.sharePeriod = "請選擇分潤週期";
  }

  if (!local.shareCalc) {
    props.errors.shareCalc = "請選擇分潤計算方式";
  } else if (local.shareCalc === "other" && !local.shareCalcOther?.other) {
    props.errors.shareCalc = "請填寫其他分潤計算方式";
  }

  if (!local.sharePay) {
    props.errors.sharePay = "請選擇分潤支付方式";
  } else if (local.sharePay === "other" && !local.sharePayOther?.other) {
    props.errors.sharePay = "請填寫其他分潤支付方式";
  }

  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step7");
  }
}
</script>

<style scoped lang="scss">

.form-card {
  width: 100%;
  max-width: 540px;
  border-radius: 24px;
  padding: 16px;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 24px 20px;
    border-radius: 16px;
  }
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.content {
  width: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}

.note {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  margin-bottom: 0;
}

.btn-submit {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #ff8a5b 0%, #ff6b4a 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 32px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 106, 74, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 確保子組件內容不超出 */
:deep(.form-group) {
  width: 100%;
  max-width: 100%;
}

:deep(.option) {
  max-width: 100%;
}

:deep(.textline) {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
