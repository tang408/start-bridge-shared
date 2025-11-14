<template>
  <div class="pdf-step5-part1">
    <!-- 籌備預算明細表 -->
    <div class="budget-section">
      <h3 class="subsection-title">1.「籌備期間」開辦費預算規劃 :</h3>

      <table class="budget-table">
        <thead>
          <tr>
            <th class="col-item">項目</th>
            <th class="col-amount">金額（元）</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in local.prepBudget"
            :key="index"
            :class="{ 'total-row': item.item === '總計' }"
          >
            <td class="col-item">{{ item.item }}</td>
            <td class="col-amount">
              {{ formatCurrency(item.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const local = reactive({ ...props.modelValue })

watch(local, (val) => emit('update:modelValue', val), { deep: true })

// 格式化金額
function formatCurrency(amount) {
  if (!amount) return '0'
  return parseInt(amount).toLocaleString('zh-TW')
}
</script>

<style lang="scss" scoped>
.pdf-step5-part1 {
  font-size: 14px;
  line-height: 1.6;
}

.budget-section {
  margin-bottom: 30px;

  .subsection-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
  }
}

.budget-table {
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
      padding: 14px 16px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border: 1px solid #e0e0e0;
      font-size: 15px;

      &.col-item {
        width: 60%;
      }

      &.col-amount {
        width: 40%;
        text-align: right;
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
          border-top: 2px solid #ffcc41;
          border-bottom: 2px solid #ffcc41;
        }
      }
    }

    td {
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      color: #333;

      &.col-item {
        font-weight: 500;
      }

      &.col-amount {
        text-align: right;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 14px;
      }
    }
  }
}

.budget-notes {
  background-color: #f8f9fa;
  border-left: 4px solid #ffcc41;
  padding: 16px 20px;
  border-radius: 4px;

  .note-text {
    margin: 0;
    color: #666;
    font-size: 13px;
    line-height: 1.6;

    strong {
      color: #333;
    }
  }
}

// 打印優化
@media print {
  .budget-table {
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
}
</style>
