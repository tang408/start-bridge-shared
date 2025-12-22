<template>
  <div class="table-wrap w-100">
    <table class="records-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="col.thClass"
            :style="{ width: col.width || 'auto' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="col.tdClass"
            :data-th="col.label"
            :style="{ width: col.width || 'auto' }"
          >
            <slot
              v-if="$slots[col.key]"
              :name="col.key"
              :row="row"
              :value="row[col.key]"
            />
            <template v-else>{{ row[col.key] }}</template>
          </td>
        </tr>
        <tr v-if="!rows || !rows.length">
          <td :colspan="columns.length" class="empty">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  emptyText: { type: String, default: "目前沒有資料" },
});
</script>

<style lang="scss" scoped>
.table-wrap {
  @media (max-width: 576px) {
    padding: 0;
  }
}

thead {
  @media (max-width: 576px) {
    display: none;
  }
}

tbody {
  @media (max-width: 576px) {
    gap: 10px;
    display: grid;
  }
  tr {
    @media (max-width: 576px) {
      display: grid;
      grid-template-columns: 1fr;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      padding: 14px 16px;
      border: 1px solid #eee;
    }
  }
  td {
    text-align: start;
    @media (max-width: 576px) {
      grid-template-columns: 88px 1fr;
      gap: 8px;
      padding: 6px 0;
      border-top: 0;
      font-size: 15px;
      max-width: 100%;
      display: grid;
      align-items: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &::before {
      @media (max-width: 576px) {
        content: attr(data-th);
        color: $text-dark;
        font-size: 13px;
        line-height: 1;
      }
    }
    &:last-child {
      @media (max-width: 576px) {
        border-bottom: none !important;
      }
    }
  }
}

.records-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  @media (max-width: 576px) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 12px;
  }

  thead th {
    text-align: left;
    font-weight: 400;
    font-size: 15px;
    line-height: 140%;
    color: #555555;
    padding: 10px 6px;
  }

  tbody td {
    padding: 10px 6px;
    border-top: 1px solid #eaeaea;
    vertical-align: middle;
    font-weight: 400;
    font-size: 14px;
    line-height: 140%;
    color: #555555;
    @media (max-width: 576px) {
      border-top: none;
      border-bottom: 1px solid #eaeaea;
      width: 100% !important;
    }
  }
  .ta-right {
    text-align: start;
  }

  .ellipsis {
    max-width: 380px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    @media (max-width: 576px) {
      max-width: 100%;
    }
  }
  .empty {
    text-align: center;
    color: #9aa39d;
    padding: 28px 0;
    @media (max-width: 576px) {
      background: transparent;
      border: 0;
      box-shadow: none;
      padding: 24px 0;
      display: block;
    }
  }
}

.table-wrap-date {
  letter-spacing: 2px;
}
</style>
