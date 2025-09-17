<template>
  <form class="form mt-4" @submit.prevent="submitStep">
    <div class="gap-3 d-grid">
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
              <td data-label="用途項目">{{ row.item }}</td>
              <td data-label="金額（元）">
                <SharedInput
                  :id="`amount-${idx}`"
                  type="number"
                  v-model="row.amount"
                  placeholder="輸入金額"
                  class="p-510"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="errors.prepBudget" class="error-msg">
          {{ errors.prepBudget }}
        </p>
      </div>

      <div>
        <div class="mb-3">
          <label class="fg-label">2. 「營運期間」損益成本結構 (%數)</label>
          <table class="records-table w-100 mt-2">
            <thead>
              <tr>
                <th colspan="4" class="text-start">
                  <div class="th-number">
                    以營業額目標：
                    <SharedInput
                      id="targetRevenue"
                      v-model="local.targetRevenue"
                      placeholder="輸入金額"
                      class="inline-input w-110 p-510 border-1"
                    />
                    為標準預期所需比例之佔比：
                  </div>
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
              <tr v-for="(row, idx) in local.costStruct" :key="idx">
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
                  />
                </td>
                <td data-label="金額">
                  <SharedInput
                    :id="`amount-dollar-${idx}`"
                    type="number"
                    v-model="row.amount"
                    placeholder="金額"
                    class="p-510"
                  />
                </td>
                <td data-label="備註">
                  <SharedInput
                    :id="`note-${idx}`"
                    v-model="row.note"
                    placeholder="備註"
                    class="p-510"
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
            />
            <span class="option-label">
              若營運月營業額達
              <SharedInput
                id="rewardAmount"
                type="number"
                v-model="local.rewardAmount"
                placeholder="金額"
                class="inline-input w-110 p-510"
                :disabled="!local.rewardEnabled"
              />
              元，公司即按營業額之
              <SharedInput
                id="rewardPercent"
                type="number"
                v-model="local.rewardPercent"
                placeholder="%"
                class="inline-input w-110 p-510"
                :disabled="!local.rewardEnabled"
              />
              % 給予創業者獎勵營運團隊。
            </span>
          </label>
        </div>
      </div>

      <SharedRadio
        class="fundNote"
        v-model="local.fundNote"
        label="3. 資金需求與說明："
        name="fundNote"
        :options="[
          {
            text: '我承諾所有資金僅用於專案經營與平台規範用途，絕不挪作私用或違法行為。',
            value: '1',
          },
        ]"
        :error="errors.fundNote"
      />

      <div class="mb-3">
        <SharedRadio
          v-model="local.reportSelected"
          v-model:extra="local.otherReport"
          label="4. 定期報告說明："
          name="reportOptions"
          :options="local.reportOptions"
          :error="errors.reportSelected"
        />
      </div>
    </div>

    <button type="button" class="apply-btn write w-100 mt-4"  @click="submitStep">下一步</button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
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

  if (!local.prepBudget.every((row) => row.amount && row.amount !== "")) {
    props.errors.prepBudget = "請填寫所有開辦費預算";
  }

  if (!local.targetRevenue) {
    props.errors.targetRevenue = "請輸入營業額目標";
  }

  if (
    !local.costStruct.every(
      (row) =>
        row.percent && row.amount && row.percent !== "" && row.amount !== ""
    )
  ) {
    props.errors.costStruct = "請完整填寫成本結構（% 與金額）";
  }

  if (!local.fundNote) {
    props.errors.fundNote = "請選擇資金需求";
  }

  if (!local.reportSelected) {
    props.errors.reportSelected = "請選擇一項定期報告方式";
  }

  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step6");
  }
}
</script>

<style lang="scss" scoped>
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
</style>
