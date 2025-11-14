<template>
  <div class="pdf-step5-part2">
    <!-- 成本結構表 -->
    <div class="cost-section">
      <div class="info-label">
        以營業額目標：<strong>{{ formatCurrency(local.targetRevenue) }} 元</strong> 為基準，規劃各項成本結構比例及金額
      </div>
      <table class="cost-table">
        <thead>

          <tr>
            <th class="col-item">項目</th>
            <th class="col-percent">佔比（%）</th>
            <th class="col-amount">金額（元）</th>
            <th class="col-note">備註</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in local.costStruct"
            :key="index"
            :class="{ 'total-row': item.item === '總計' }"
          >
            <td class="col-item">
              <div class="item-name">{{ item.item }}</div>
              <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
            </td>
            <td class="col-percent">{{ item.percent || '-' }}</td>
            <td class="col-amount">{{ formatCurrency(item.amount) }}</td>
            <td class="col-note">{{ item.note || '-' }}</td>
          </tr>
        </tbody>
      </table>
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
              若營運月營業額達 {{    formatCurrency(local.rewardAmount)}}
              元，公司即撥發營業額之 {{ local.rewardPercent}}
              % 給予創業者獎勵運營團隊。
            </span>
      </label>
    </div>
    <div class="mb-3 reward-filter ">
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
      </div>
  </div>
  <div class="mb-3">
    <SharedRadio
        v-model="local.reportSelected"
        v-model:extra="local.otherReport"
        label="4. 定期財報公開聲明："
        name="reportOptions"
        :options="local.reportOptions"
        :error="errors.reportSelected"
        :disabled="readonly"
    />
  </div>

</template>

<script setup>
import {reactive, ref, watch} from 'vue'
import Header from "@/components/Header.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
const isChecked = ref(true)
const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const local = reactive({ ...props.modelValue })

watch(local, (val) => emit('update:modelValue', val), { deep: true })

console.log('local in PDFStep5Part2:', local)
// 格式化金額
function formatCurrency(amount) {
  if (!amount) return '0'
  return parseInt(amount).toLocaleString('zh-TW')
}

// 獲取資金使用備註文字
function getFundNoteText() {
  if (local.fundNote === 1 || local.fundNote === '1') {
    return '依實際需求調整'
  }
  return local.fundNote || '依實際需求調整'
}

// 獲取報表文字
function getReportText() {
  if (!local.reportSelected) return '-'

  if (local.reportSelected === 'other') {
    return `其他: ${local.otherReport?.other || ''}`
  }

  const reportOptions = {
    'pos': '提供店內 POS 帳號並開啟營業報表權限',
    'monthly': '每月/季「現金流量表」，需於次月 15 日前提供',
    'season': '每季/年度「財務報表」,需於當季後次月 15 日前提供',
    'yearly': '每年度「資產負債表」,需於次年一月底前提供'
  }

  return reportOptions[local.reportSelected] || local.reportSelected
}
</script>

<style lang="scss" scoped>
$primary-color: #ffcc41;
$secondary-color: #ff6634;
$text-deep: #1a1a1a;
$text-dark: #333;
$text-gray: #666;
$border-color: #e0e0e0;

.pdf-step5-part2 {
  font-size: 14px;
  line-height: 1.6;
}

// 區塊樣式
.cost-section,
.revenue-section {
  margin-bottom: 30px;

  .subsection-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-dark;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
  }
}

// 成本結構表
.cost-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  // 防止表格被切斷
  page-break-inside: avoid;
  break-inside: avoid;

  thead {
    background-color: #f5f5f5;

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th {
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border: 1px solid $border-color;
      font-size: 14px;

      &.col-item {
        width: 35%;
      }

      &.col-percent {
        width: 15%;
        text-align: center;
      }

      &.col-amount {
        width: 25%;
        text-align: right;
      }

      &.col-note {
        width: 25%;
      }
    }
  }

  tbody {
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
      transition: background-color 0.2s ease;

      &:hover:not(.total-row) {
        background-color: #fafafa;
      }

      &.total-row {
        background-color: #fff9e6;
        font-weight: 700;

        td {
          border-top: 2px solid $primary-color;
          border-bottom: 2px solid $primary-color;
        }
      }
    }

    td {
      padding: 12px;
      border: 1px solid $border-color;
      color: $text-dark;

      &.col-item {
        .item-name {
          font-weight: 500;
        }

        .item-desc {
          font-size: 12px;
          color: $text-gray;
          margin-top: 4px;
        }
      }

      &.col-percent {
        text-align: center;
        font-family: 'Monaco', 'Consolas', monospace;
      }

      &.col-amount {
        text-align: right;
        font-family: 'Monaco', 'Consolas', monospace;
      }

      &.col-note {
        font-size: 13px;
        color: $text-gray;
      }
    }
  }
}

// 營收目標資訊卡片
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid $border-color;
  border-left: 4px solid $primary-color;
  padding: 20px;
  border-radius: 8px;

  // 防止卡片被切斷
  page-break-inside: avoid;
  break-inside: avoid;

  &.highlight {
    background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
    border-left-color: $secondary-color;
    box-shadow: 0 2px 8px rgba($secondary-color, 0.1);
  }

  .info-label {
    font-size: 13px;
    font-weight: 600;
    color: $text-gray;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      color: $secondary-color;
    }
  }

  .info-value {
    font-size: 15px;
    color: $text-dark;
    line-height: 1.6;

    strong {
      color: $secondary-color;
      font-weight: 600;
    }

    .highlight-text {
      font-size: 18px;
    }
  }
}

// 打印優化
@media print {
  .cost-table {
    thead {
      display: table-header-group;
    }

    tbody {
      display: table-row-group;
    }

    tr {
      page-break-inside: avoid;
    }
  }

  .info-card {
    page-break-inside: avoid;
  }
}
</style>
