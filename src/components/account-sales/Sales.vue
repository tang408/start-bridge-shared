<template>
  <div class="fs-24">轄下業務列表</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="filter.rank"
        placeholder="職級"
        :options="[
          { label: '全部', value: '' },
          { label: '職級A', value: 'A' },
          { label: '職級B', value: 'B' },
        ]"
      />

      <SharedDropdown
        v-model="filter.dateOrder"
        placeholder="依入職日期"
        :options="[
          { label: '新→舊', value: 'desc' },
          { label: '舊→新', value: 'asc' },
        ]"
      />

      <SharedDropdown
        v-model="filter.region"
        placeholder="依所在區域排序"
        :options="[
          { label: '全部', value: '' },
          { label: '台北市', value: '台北市' },
          { label: '新北市', value: '新北市' },
          { label: '台中市', value: '台中市' },
        ]"
      />

      <SharedDropdown
        v-model="filter.staffCount"
        placeholder="依轄下業務人數"
        :options="[
          { label: '少到多', value: 'asc' },
          { label: '多到少', value: 'desc' },
        ]"
      />
    </div>

    <SharedTable
      :columns="columns"
      :rows="displayedMembers"
      empty-text="目前沒有符合條件的業務"
    />
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";

const columns = [
  { key: "rank", label: "職級" },
  { key: "date", label: "入職日期" },
  { key: "region", label: "業務區域" },
  { key: "name", label: "業務名字" },
  { key: "phone", label: "電話" },
  { key: "performance", label: "本月業績" },
  { key: "staffCount", label: "轄下業務數" },
];

const members = reactive([
  {
    id: 1,
    rank: "職級A",
    date: "2024-12-03",
    region: "台北市",
    name: "張曉婷",
    phone: "0987-654-321",
    performance: 30000000,
    staffCount: 10,
  },
  {
    id: 2,
    rank: "職級B",
    date: "2024-12-03",
    region: "台中市",
    name: "王一天",
    phone: "0987-654-321",
    performance: 10000000,
    staffCount: 2,
  },
]);

const filter = reactive({
  rank: "",
  dateOrder: "",
  region: "",
  staffCount: "",
});

const displayedMembers = computed(() => {
  let list = [...members];

  if (filter.rank) list = list.filter((m) => m.rank.includes(filter.rank));
  if (filter.region) list = list.filter((m) => m.region === filter.region);

  if (filter.dateOrder) {
    list.sort((a, b) =>
      filter.dateOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }

  if (filter.staffCount) {
    list.sort((a, b) =>
      filter.staffCount === "asc"
        ? a.staffCount - b.staffCount
        : b.staffCount - a.staffCount
    );
  }

  return list.map((m) => ({
    ...m,
    performance: m.performance.toLocaleString(),
    staffCount: `${m.staffCount}人`,
  }));
});
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
