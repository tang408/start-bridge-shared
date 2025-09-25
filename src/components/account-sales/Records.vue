<template>
  <div class="fs-24">業績紀錄</div>

  <div class="w-100">
    <div class="cards-grid">
      <SharedSalesCard title="共創者">
        業績 = 共創者投入專案金額<br />
        獎金 = 業績 * 5% * xx%
      </SharedSalesCard>

      <SharedSalesCard title="創業者">
        業績 = 共創者投入專案金額<br />
        獎金 = 業績 * 5% * xx%
      </SharedSalesCard>
    </div>

    <div class="filter-table">
      <div class="toolbar">
        <SharedDropdown
          v-model="filter.dateOrder"
          placeholder="依成立日期排序"
          :options="[
            { label: '新→舊', value: 'desc' },
            { label: '舊→新', value: 'asc' },
          ]"
        />
        <SharedDropdown
          v-model="filter.role"
          placeholder="依角色排序"
          :options="[
            { label: '全部', value: '' },
            { label: '創業者', value: '創業者' },
            { label: '共創者', value: '共創者' },
          ]"
        />
        <SharedDropdown
          v-model="filter.amountOrder"
          placeholder="依專案金額排序"
          :options="[
            { label: '少到多', value: 'asc' },
            { label: '多到少', value: 'desc' },
          ]"
        />
      </div>

      <SharedTable
        :columns="columns"
        :rows="displayedRecords"
        empty-text="目前沒有符合條件的紀錄"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedSalesCard from "@/components/shared/Shared-Sales-Card.vue";

const columns = [
  { key: "date", label: "日期" },
  { key: "project", label: "專案名稱" },
  { key: "role", label: "角色" },
  { key: "member", label: "會員" },
  { key: "performance", label: "我的業績" },
];

const records = reactive([
  {
    id: 1,
    date: "2024-12-03",
    project: "專案名稱專案名稱專案名稱",
    role: "創業者",
    member: "張小白",
    performance: 100000,
  },
  {
    id: 2,
    date: "2024-12-02",
    project: "另一個專案名稱",
    role: "共創者",
    member: "李小黑",
    performance: 50000,
  },
]);

const filter = reactive({
  dateOrder: "",
  role: "",
  amountOrder: "",
});

const displayedRecords = computed(() => {
  let list = [...records];

  if (filter.role) list = list.filter((r) => r.role === filter.role);

  if (filter.dateOrder) {
    list.sort((a, b) =>
      filter.dateOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }

  if (filter.amountOrder) {
    list.sort((a, b) =>
      filter.amountOrder === "asc"
        ? a.performance - b.performance
        : b.performance - a.performance
    );
  }

  return list.map((r) => ({
    ...r,
    performance: r.performance.toLocaleString(),
  }));
});
</script>

<style scoped lang="scss">
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
