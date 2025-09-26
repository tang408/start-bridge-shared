<template>
  <div class="fs-24">專案管理系統</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="projectFilter.dateOrder"
        placeholder="依成立日期排序"
        :options="[
          { label: '新→舊', value: 'desc' },
          { label: '舊→新', value: 'asc' },
        ]"
      />

      <SharedDropdown
        v-model="projectFilter.region"
        placeholder="依所在地區排序"
        :options="[
          { label: '全部', value: '' },
          { label: '台北市', value: '台北市' },
          { label: '新北市', value: '新北市' },
          { label: '桃園市', value: '桃園市' },
        ]"
      />

      <SharedDropdown
        v-model="projectFilter.status"
        placeholder="依專案進度排序"
        :options="[
          { label: '全部', value: '' },
          { label: '待審核', value: '待審核' },
          { label: '審核中', value: '審核中' },
          { label: '已通過', value: '已通過' },
          { label: '未通過', value: '未通過' },
        ]"
      />
    </div>

    <SharedTable
      :columns="columns"
      :rows="displayedProjects"
      empty-text="目前沒有符合條件的專案"
    >
      <template #name="{ value }">
        <span class="ellipsis" :title="value">{{ value }}</span>
      </template>

      <template #status="{ value }">
        <span class="status-pill">{{ value }}</span>
      </template>

      <template #actions="{ row }">
        <button class="icon-btn" @click="viewProject(row)">
          <img src="@/assets/icon/search.png" alt="查看" />
        </button>
      </template>
    </SharedTable>
  </div>

  <SharedModal
    v-model="showModal"
    title="專案詳情"
    mode="project"
    @apply="onManage"
    @update:modelValue="handleClose"
    class="project-modal"
    titleAlign="center"
  >
    <div>專案名稱：{{ selectedProject.name }}</div>
    <div>專案狀態：{{ selectedProject.region }}</div>
    <div>創業者：{{ selectedProject.creator }}</div>
    <div>總共創金額：{{ selectedProject.amount }}</div>
    <hr />
    <div>共創者(用加入時間排序?)</div>
    <div>趙曉喬：{{ selectedProject.overdue }}</div>
    <div>林大寶：{{ selectedProject.case1 }}</div>
    <div>張大牛：{{ selectedProject.case2 }}</div>
  </SharedModal>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";

const showModal = ref(false);
const selectedProject = ref({});

const columns = [
  { key: "date", label: "日期" },
  { key: "region", label: "專案區域" },
  { key: "name", label: "專案名稱" },
  { key: "creator", label: "創業者" },
  { key: "status", label: "專案進度" },
  { key: "actions", label: "查看" },
];

const projects = reactive([
  {
    id: 1,
    date: "2024-12-03",
    region: "台北市",
    name: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    creator: "王大明",
    status: "待審核",
    amount: "1,200,000",
    overdue: "已用規劃方案的案例",
    case1: "已用規劃方案的案例",
    case2: "尚有增額額",
  },
  {
    id: 2,
    date: "2024-12-03",
    region: "台北市",
    name: "專案名稱2",
    creator: "王大明",
    status: "審核中",
    amount: "800,000",
    overdue: "未使用案例",
    case1: "審核中案例",
    case2: "尚無紀錄",
  },
]);

const projectFilter = reactive({
  dateOrder: "",
  region: "",
  status: "",
});

const displayedProjects = computed(() => {
  let list = [...projects];
  if (projectFilter.region)
    list = list.filter((p) => p.region === projectFilter.region);
  if (projectFilter.status)
    list = list.filter((p) => p.status === projectFilter.status);

  if (projectFilter.dateOrder) {
    list.sort((a, b) =>
      projectFilter.dateOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }
  return list;
});

function viewProject(row) {
  selectedProject.value = row;
  showModal.value = true;
}

function handleClose(val) {
  showModal.value = val;
}

function onManage() {
  alert(`管理專案：${selectedProject.value.name}`);
}
</script>

<style lang="scss" scoped>
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 14px;
  @media (max-width: 576px) {
    padding: 2px 0;
  }
}
.project-modal .modal-body div {
  font-size: 14px;
  line-height: 1.8;
}
</style>
