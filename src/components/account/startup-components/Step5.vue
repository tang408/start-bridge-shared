<script setup>
import { reactive, watch, nextTick, computed } from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import SharedCheckline from "@/components/shared/Shared-Checkline.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
  step1Budget: { type: [String, Number], default: '' }
});

const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive({ ...props.modelValue });

let isRecalculating = false;

// 計算月營業額目標
const targetRevenue = computed(() => {
  return Number(local.targetRevenue) || 0;
});

// 檢查是否超過月營業額
const isOverBudget = computed(() => {
  const totalAmount = local.costStruct
      .filter(item => item.item !== '總計')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return totalAmount > targetRevenue.value && targetRevenue.value > 0;
});

// 獲取超額金額
const overBudgetAmount = computed(() => {
  if (!isOverBudget.value) return 0;

  const totalAmount = local.costStruct
      .filter(item => item.item !== '總計')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return totalAmount - targetRevenue.value;
});

// 只在非計算時同步到父組件
watch(local, (val) => {
  if (!isRecalculating) {
    emit("update:modelValue", val);
  }
}, { deep: true });

// 監聽 percent 變化 → 計算 amount
watch(
    () => local.costStruct.map(r => r.percent),
    () => {
      if (!isRecalculating && targetRevenue.value > 0) {
        isRecalculating = true;
        nextTick(() => {
          updateAmountsFromPercents();
          isRecalculating = false;
        });
      }
    },
    { deep: true }
);

// 監聽營業額變化 → 按比例重算金額
watch(
    () => local.targetRevenue,
    (newValue, oldValue) => {
      if (!isRecalculating && newValue !== oldValue && Number(newValue) > 0) {
        isRecalculating = true;
        nextTick(() => {
          updateAmountsFromPercents();
          isRecalculating = false;
        });
      }
    }
);

watch(
    () => local.prepBudget,
    () => {
      if (!isRecalculating) {
        recalcPrepBudget();
      }
    },
    { deep: true }
);

async function recalcPrepBudget() {
  isRecalculating = true;

  await nextTick();

  const prepBudgetTotal = local.prepBudget
      .slice(0, local.prepBudget.length - 1)
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const lastRow = local.prepBudget[local.prepBudget.length - 1];
  if (lastRow) {
    lastRow.amount = prepBudgetTotal;
  }

  await nextTick();

  isRecalculating = false;
}

// 根據百分比計算金額
function updateAmountsFromPercents() {
  const costItems = ["物料成本", "人事成本", "租金成本", "經營管理成本"];

  let totalCostAmount = 0;

  // 計算成本項目的金額
  local.costStruct.forEach(row => {
    if (costItems.includes(row.item)) {
      const percent = Number(row.percent) || 0;
      const amount = Math.round((targetRevenue.value * percent) / 100);
      row.amount = String(amount);
      totalCostAmount += amount;
    }
  });

  // 🔧 淨利用減法計算（確保總和正確）
  const netProfitRow = local.costStruct.find(r => r.item === "淨利");
  if (netProfitRow) {
    const totalCostPercent = local.costStruct
        .filter(r => costItems.includes(r.item))
        .reduce((sum, r) => sum + Number(r.percent || 0), 0);

    netProfitRow.percent = String(Math.round((100 - totalCostPercent) * 100) / 100);

    // 🔧 淨利金額 = 營業額 - 成本總額（避免誤差）
    const netProfitAmount = targetRevenue.value - totalCostAmount;
    netProfitRow.amount = String(netProfitAmount);
  }

  // 計算總計
  calculateTotal();
}

// 🔧 根據金額計算百分比（blur 時觸發）
function updatePercentsFromAmounts() {
  if (!targetRevenue.value || targetRevenue.value <= 0) return;

  const costItems = ["物料成本", "人事成本", "租金成本", "經營管理成本"];

  let totalCostAmount = 0;

  // 🔧 只計算百分比，不修改金額
  local.costStruct.forEach(row => {
    if (costItems.includes(row.item)) {
      const amount = Number(row.amount) || 0;
      totalCostAmount += amount;
      const percent = (amount / targetRevenue.value) * 100;
      row.percent = String(Math.round(percent * 100) / 100);
    }
  });

  // 🔧 淨利金額 = 營業額 - 成本總額（關鍵！）
  const netProfitRow = local.costStruct.find(r => r.item === "淨利");
  if (netProfitRow) {
    const netProfitAmount = targetRevenue.value - totalCostAmount;
    netProfitRow.amount = String(netProfitAmount);

    // 計算淨利百分比
    const netProfitPercent = (netProfitAmount / targetRevenue.value) * 100;
    netProfitRow.percent = String(Math.round(netProfitPercent * 100) / 100);
  }

  // 計算總計
  calculateTotal();
}

// 🔧 處理金額輸入失去焦點
function handleAmountBlur() {
  if (isRecalculating || !targetRevenue.value) return;

  isRecalculating = true;
  nextTick(() => {
    updatePercentsFromAmounts();
    isRecalculating = false;
  });
}

// 計算總計
function calculateTotal() {
  let totalPercent = 0;
  let totalAmount = 0;

  local.costStruct.forEach((item) => {
    if (item.item !== '總計') {
      totalPercent += Number(item.percent) || 0;
      totalAmount += Number(item.amount) || 0;
    }
  });

  const totalRow = local.costStruct.find(item => item.item === '總計');
  if (totalRow) {
    totalRow.percent = String(Math.round(totalPercent * 100) / 100);
    totalRow.amount = String(totalAmount);
  }
}

function submitStep() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  if (!local.targetRevenue) {
    props.errors.targetRevenue = "請輸入營業額目標";
  }

  // 檢查是否超額
  if (isOverBudget.value) {
    props.errors.costStruct = `成本結構總金額超過月營業額目標 ${overBudgetAmount.value.toLocaleString()} 元`;
  }

  const step1BudgetNum = Number(props.step1Budget) || 0;
  const prepBudgetTotal = local.prepBudget
      .slice(0, local.prepBudget.length - 1)
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  if (prepBudgetTotal !== step1BudgetNum) {
    props.errors.prepBudget = `開辦費預算總額須與加盟總預算一致（${step1BudgetNum.toLocaleString()} 元）`;
  }

  const costStructTotalAmount = local.costStruct.find(
      (row) => row.item === "總計"
  )?.amount;

  // 修正總計驗證邏輯（允許小誤差）
  const totalAmountNum = Number(costStructTotalAmount) || 0;
  const targetRevenueNum = Number(local.targetRevenue) || 0;

  if (Math.abs(totalAmountNum - targetRevenueNum) > 1) {
    props.errors.costStruct = "成本結構總計金額須等於營業額目標金額";
  }

  if (!local.fundNote) {
    props.errors.fundNote = "請選擇資金需求";
  }

  const hasSelectedReport = Object.values(local.reportSelected || {}).some(v => v.checked);
  if (!hasSelectedReport) {
    props.errors.reportSelected = "請選擇一項定期報告方式";
  }

  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step6");
  }
}

watch(
    () => local.rewardPercent,
    (newValue) => {
      let percent = Number(newValue);
      if (isNaN(percent) || percent < 0) {
        percent = 0;
      } else if (percent > 100) {
        percent = 100;
      }
      local.rewardPercent = String(percent);
    }
);
</script>

<template>
  <form class="form mt-4" @submit.prevent="submitStep">
    <div class="gap-3 d-grid">
      <button
          v-if="readonly"
          type="button"
          class="btn-back mb-3"
          @click="backToList"
      >
        ← 返回列表
      </button>
      <h5 class="form-title">三、財務規劃與資金用途</h5>

      <div class="mb-3">
        <label class="fg-label">1.「籌備期間」開辦費預算規劃 :</label>
        <table class="records-table w-100 mt-2">
          <thead>
          <tr>
            <th>用途項目</th>
            <th>金額（元）</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, idx) in local.prepBudget" :key="idx">
            <td data-label="用途項目">
              <SharedInput
                  v-if="row.editable"
                  :id="`item-title-${idx}`"
                  type="text"
                  v-model="row.customTitle"
                  placeholder="其他用途(請輸入)"
                  :readonly="readonly"
              />
              <span v-else>{{ row.item }}</span>
            </td>
            <td data-label="金額(元)">
              <SharedInput
                  :id="`amount-${idx}`"
                  type="text"
                  :format-number="true"
                  v-model="row.amount"
                  placeholder="輸入金額"
                  :readonly="readonly"
              />
            </td>
          </tr>
          </tbody>
        </table>
        <p v-if="errors.prepBudget" class="error-msg" :readonly="readonly">
          {{ errors.prepBudget }}
        </p>
      </div>

      <div>
        <div class="mb-3">
          <label class="fg-label">2. 「營運期間」損益成本結構 (%數)</label>

          <!-- 手機版：表格外顯示 -->
          <div class="revenue-target-mobile">
            <div class="th-number">
              以月營業額目標：
              <SharedInput
                  id="targetRevenue-mobile"
                  v-model="local.targetRevenue"
                  type="text"
                  :format-number="true"
                  placeholder="輸入金額"
                  class="inline-input w-110 p-510 border-1"
                  :readonly="readonly"
              />
              為標準預期所需比例之佔比：
            </div>
            <p v-if="errors.targetRevenue" class="error-msg">
              {{ errors.targetRevenue }}
            </p>
          </div>

          <table class="records-table w-100 mt-2">
            <thead>
            <tr>
              <th colspan="4" class="text-start">
                <div class="th-number">
                  以月營業額目標：
                  <SharedInput
                      id="targetRevenue"
                      v-model="local.targetRevenue"
                      type="text"
                      :format-number="true"
                      placeholder="輸入金額"
                      class="inline-input w-110 p-510 border-1"
                      :readonly="readonly"
                  />
                  為標準預期所需比例之佔比：
                </div>
                <p v-if="errors.targetRevenue" class="error-msg">
                  {{ errors.targetRevenue }}
                </p>
              </th>
            </tr>
            <tr>
              <th>成本分類</th>
              <th>佔比(%)</th>
              <th>金額</th>
              <th>備註</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(row, idx) in local.costStruct"
                :key="idx"
                :class="{
                  'total-row': row.item === '總計',
                  'over-budget-row': isOverBudget && row.item === '總計'
                }"
            >
              <td data-label="成本分類">
                <div>
                  {{ row.item }}
                  <p v-if="row.desc" class="sub-desc">{{ row.desc }}</p>
                </div>
              </td>
              <td data-label="佔比(%)">
                <SharedInput
                    :id="`percent-${idx}`"
                    type="number"
                    v-model="row.percent"
                    placeholder="%"
                    class="p-510"
                    :readonly="readonly || row.item === '總計' || row.item === '淨利'"
                />
              </td>
              <td data-label="金額">
                <SharedInput
                    :id="`amount-dollar-${idx}`"
                    type="text"
                    :format-number="true"
                    v-model="row.amount"
                    @blur="handleAmountBlur"
                    placeholder="金額"
                    class="p-510"
                    :readonly="readonly || row.item === '總計' || row.item === '淨利'"
                />
              </td>
              <td data-label="備註">
                <SharedInput
                    :id="`note-${idx}`"
                    v-model="row.note"
                    placeholder="備註"
                    class="p-510"
                    :readonly="readonly || row.item === '總計'"
                />
              </td>
            </tr>
            </tbody>
          </table>
          <p v-if="errors.costStruct" class="error-msg">
            {{ errors.costStruct }}
          </p>
        </div>

        <div class="mb-3 reward-filter">
          <label class="fs-14 d-flex gap-2 reward-option">
            <input
                type="checkbox"
                v-model="local.rewardEnabled"
                class="reward-checkbox"
                :readonly="readonly"
            />
            <span class="option-label">
              若當月營業額達
              <SharedInput
                  id="rewardAmount"
                  type="text"
                  :format-number="true"
                  v-model="local.rewardAmount"
                  placeholder="金額"
                  class="inline-input w-110 p-510"
                  :disabled="!local.rewardEnabled"
                  :readonly="readonly"
              />
              元，公司即撥發營業額之
              <SharedInput
                  id="rewardPercent"
                  type="number"
                  v-model="local.rewardPercent"
                  placeholder="%"
                  class="inline-input w-110 p-510"
                  :disabled="!local.rewardEnabled"
                  :readonly="readonly"
              />
              % 給予創業者獎勵運營團隊。
            </span>
          </label>
        </div>
      </div>

      <SharedRadio
          class="fundNote"
          v-model="local.fundNote"
          label="3. 資金使用原則聲明："
          name="fundNote"
          :options="[
          {
            text: '我承諾所有資金僅用於專案經營與平台規範用途，絕不挪作私用或違法行為。',
            value: '1',
          },
        ]"
          :error="errors.fundNote"
          :disabled="readonly"
      />

      <div class="mb-3">
        <SharedCheckline
            v-model="local.reportSelected"
            label="4. 定期財報公開聲明："
            :options="local.reportOptions"
            :error="errors.reportSelected"
            :disabled="readonly"
        />
      </div>
    </div>
    <button type="button" class="apply-btn previous w-100 " @click="$emit('next', 'step4')">上一步</button>
    <button type="button" class="apply-btn write w-100 mt-4"  @click="submitStep">下一步</button>
  </form>
</template>

<style lang="scss" scoped>
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  border-left: 4px solid;
}

.alert-danger {
  background-color: #fee;
  color: #c33;
  border-color: #c33;
}

.over-budget-row {
  background-color: #fee !important;

  input {
    color: #c33 !important;
    font-weight: 700;
  }
}

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

.inline-input {
  display: inline-block;
  width: 100px;
  margin: 0 4px;
}

.records-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 14px;

  th,
  td {
    border: 1px solid #000000;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #c5c5c5;
    font-weight: 600;
    min-width: 120px;
  }

  td {
    background-color: #fff;
    vertical-align: middle;
  }

  input {
    width: 100%;
    padding: 5px 10px !important;
    box-sizing: border-box;
  }
}

.records-table th[colspan="4"] {
  font-weight: normal;
  text-align: left;
  padding: 10px;
  font-size: 14px;
}

.inline-input {
  display: inline-block;
  width: 120px;
  margin: 0 4px;
  text-align: center;
}

.mb-3 {
  margin-bottom: 20px;
}

.th-number {
  display: flex;
  flex-flow: wrap;
  align-items: center;
  gap: 10px;
}

.sub-desc {
  font-size: 10px;
  color: #666;
  line-height: 1.4;
  text-align: center;
  margin-bottom: 0;
}

.reward-filter {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;

  .d-flex {
    align-items: start;
  }

  .reward-checkbox {
    margin-top: 11px;
    transform: scale(1.2);
    cursor: pointer;

    @media (max-width: 576px) {
      margin-top: 10px;
    }
  }

  span {
    display: flex;
    flex-flow: wrap;
    width: 100%;
    gap: 10px;
    align-items: center;
    font-size: 15px;
    font-weight: 500;
  }
}

.reward-option {
  position: relative;
  padding-left: 28px;
  cursor: pointer;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .option-label::before {
    content: "";
    width: 18px;
    height: 18px;
    border: 2px solid #bbb;
    border-radius: 4px;
    background: #fff;
    position: absolute;
    left: 0;
    top: 8px;
  }

  input:checked + .option-label::before {
    background: #ff6634;
    border-color: #ff6634;
  }

  input:checked + .option-label::after {
    content: "✓";
    position: absolute;
    left: 4px;
    top: 6px;
    font-size: 14px;
    color: #fff;
  }
}

@media (max-width: 576px) {
  .records-table {
    display: block;
    border: 0;

    thead {
      display: none;
    }

    tbody {
      display: block;
    }

    tr {
      display: block;
      margin-bottom: 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 8px;
      background: #fff;
    }

    td {
      display: flex;
      justify-content: space-between;
      text-align: left;
      border: none;
      padding: 6px 0;

      &::before {
        content: attr(data-label);
        font-weight: bold;
        flex: 0 0 40%;
      }
    }
  }
}

.revenue-target-mobile {
  display: none;
}

@media (max-width: 576px) {
  .revenue-target-mobile {
    display: block;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .revenue-target-desktop {
    display: none;
  }

  .th-number {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
