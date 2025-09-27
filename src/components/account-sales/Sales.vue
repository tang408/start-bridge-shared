<template>
  <div class="fs-24">轄下業務列表</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="filter.rank"
        placeholder="職級"
        :options="[
          { label: '全部', value: '' },
          ...salesLevels.map(level => ({ label: level.name, value: level.name }))
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
          v-model="filter.city"
          placeholder="依所在地區排序"
          :options="[
            { label: '全部', value: '' },
            ...cities.map(city => ({ label: city.name, value: city.name }))
          ]"
      />

      <SharedDropdown
        v-model="filter.salesMemberCount"
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
import {reactive, computed, ref} from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import {useAuth} from "@/composables/useAuth.js";
import {salesApi} from "@/api/modules/sales.js";
import {cityApi} from "@/api/modules/city.js";
import {salesLevelApi} from "@/api/modules/salesLevel.js";
const { isLoggedIn, currentSales } = useAuth();

const columns = [
  { key: "rank", label: "職級" },
  { key: "startDate", label: "入職日期" },
  { key: "city", label: "業務區域" },
  { key: "name", label: "業務名字" },
  { key: "phone", label: "電話" },
  { key: "salesPerformance", label: "本月業績" },
  { key: "salesMemberCount", label: "轄下業務數" },
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
  city: "",
  salesMemberCount: "",
});

const displayedMembers = computed(() => {
  let list = [...members];

  if (filter.rank) list = list.filter((m) => m.rank.includes(filter.rank));
  if (filter.city) list = list.filter((m) => m.city === filter.city);

  if (filter.dateOrder) {
    list.sort((a, b) =>
      filter.dateOrder === "asc"
        ? new Date(a.startDate) - new Date(b.startDate)
        : new Date(b.startDate) - new Date(a.startDate)
    );
  }

  if (filter.salesMemberCount) {
    list.sort((a, b) =>
      filter.salesMemberCount === "asc"
        ? a.salesMemberCount - b.salesMemberCount
        : b.salesMemberCount - a.salesMemberCount
    );
  }

  return list.map((m) => ({
    ...m,
    performance: m.performance,
    salesMemberCount: `${m.salesMemberCount}人`,
  }));
});

const cities = ref([]);
const salesLevels = ref([]);
async function getCities() {
  const response = await cityApi.getCities()
  cities.value = response.data
}

async function getSalesLevel() {
  const response = await salesLevelApi.getSalesLevel()
  salesLevels.value = response.data
}

async function getAllSalesBySales() {
  const formData = {
    salesId: currentSales.value
  }

  const response = await salesApi.getAllSalesBySales(formData)
  const processedSales = response.data.map(sales => {
    const city = cities.value.find(city => city.id === sales.city);
    const level = salesLevels.value.find(level => level.id === sales.rank);
    return {
      ...sales,
      city: city ? city.name : '未知',
      rank: level ? level.name : '未知',
    }
  })
  console.log(processedSales.value)
  members.splice(0, members.length, ...processedSales)
}

if (isLoggedIn.value) {
  getCities()
  getSalesLevel()
  getAllSalesBySales()
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
