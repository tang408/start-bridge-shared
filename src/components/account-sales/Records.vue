<template>
  <div class="fs-24">業績紀錄</div>

  <div class="w-100">
    <div class="cards-grid">
      <SharedSalesCard title="共創者">
        業績 = {{ salesPerformance.coreFounderInfo.performance.toLocaleString() }} 元<br/>
        獎金 = {{ salesPerformance.coreFounderInfo.bonus.toLocaleString() }} 元
      </SharedSalesCard>

      <SharedSalesCard title="創業者">
        業績 = {{ salesPerformance.founderInfo.performance.toLocaleString() }} 元<br/>
        獎金 = {{ salesPerformance.founderInfo.bonus.toLocaleString() }} 元
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
import {reactive, computed, ref, onMounted} from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedSalesCard from "@/components/shared/Shared-Sales-Card.vue";
import {useAuth} from "@/composables/useAuth.js";
import {salesApi} from "@/api/modules/sales.js";

const {isLoggedIn, currentSales} = useAuth();

const columns = [
  {key: "date", label: "日期"},
  {key: "project", label: "專案名稱"},
  {key: "role", label: "角色"},
  {key: "member", label: "會員"},
  {key: "performance", label: "我的業績"},
];

const salesPerformance = ref({
  coreFounderInfo: {
    performance: 0,
    bonus: 0
  },
  founderInfo: {
    performance: 0,
    bonus: 0
  },
  performanceList: []
});

const filter = reactive({
  dateOrder: "",
  role: "",
  amountOrder: "",
});

// 將 API 返回的數據轉換為表格所需的格式
const records = computed(() => {
  return salesPerformance.value.performanceList.map((item, index) => ({
    // 使用組合鍵作為唯一 ID，確保不會重複
    id: `${item.userId}-${item.date}-${item.planName}-${index}`,
    date: item.date,
    project: item.planName,
    role: item.userType === 1 ? "創業者" : "共創者",
    member: item.userName,
    performance: item.performance,
  }));
});

const displayedRecords = computed(() => {
  let list = [...records.value];

  // 角色篩選
  if (filter.role) {
    list = list.filter((r) => r.role === filter.role);
  }

  // 日期排序
  if (filter.dateOrder) {
    list.sort((a, b) =>
        filter.dateOrder === "asc"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date)
    );
  }

  // 金額排序
  if (filter.amountOrder) {
    list.sort((a, b) =>
        filter.amountOrder === "asc"
            ? a.performance - b.performance
            : b.performance - a.performance
    );
  }

  // 格式化業績數字，保留原始 ID
  return list.map((r) => ({
    id: r.id, // 保留原始的唯一 ID
    date: r.date,
    project: r.project,
    role: r.role,
    member: r.member,
    performance: r.performance.toLocaleString(),
  }));
});

async function getSalesPerformance() {
  try {
    const formData = {
      salesId: currentSales.value
    }

    const response = await salesApi.getSalesPerformanceBySales(formData);
    if (response.code === 0) {
      salesPerformance.value = response.data;
    }
  } catch (error) {
    console.error('獲取業績資料失敗:', error);
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    getSalesPerformance();
  }
})
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
