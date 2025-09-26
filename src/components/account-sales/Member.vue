<template>
  <div class="fs-24">轄下會員列表</div>

  <div class="filter-table">
    <div class="toolbar">
      <SharedDropdown
        v-model="filter.identity"
        placeholder="身分別"
        :options="[
          { label: '全部', value: '' },
          { label: '創業者', value: '創業者' },
          { label: '共創者', value: '共創者' },
        ]"
      />

      <SharedDropdown
        v-model="filter.dateOrder"
        placeholder="依專案時間排序"
        :options="[
          { label: '新→舊', value: 'desc' },
          { label: '舊→新', value: 'asc' },
        ]"
      />

      <SharedDropdown
        v-model="filter.region"
        placeholder="依所在地區排序"
        :options="[
          { label: '全部', value: '' },
          { label: '台北市', value: '台北市' },
          { label: '新北市', value: '新北市' },
          { label: '桃園市', value: '桃園市' },
        ]"
      />

      <SharedDropdown
        v-model="filter.status"
        placeholder="依專案狀態排序"
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
      :rows="displayedMembers"
      empty-text="目前沒有符合條件的會員"
    >
      <template #actions="{ row }">
        <button class="icon-btn" @click="viewMember(row)">
          <img src="@/assets/icon/search.png" alt="查看" />
        </button>
      </template>
    </SharedTable>
  </div>

  <SharedModal
    v-model="showModal"
    title="會員詳細資訊"
    mode="member"
    @update:modelValue="handleClose"
    class="member-modal form"
    titleAlign="center"
  >
    <div class="modal-section">
      <div class="title">基本資料</div>
      <div>姓名：{{ selectedMember.name }}</div>
      <div>會員身分：{{ selectedMember.type }}</div>
      <div>已參與專案數量：創業: {{ selectedMemberDetail.founderPlanCount }} 、共創: {{selectedMemberDetail.coreFounderPlanCount }}</div>
    </div>

    <div class="modal-section mt-3">
      <div class="title">創業者資訊</div>
      <div>姓名：{{ selectedMember.name }}</div>
      <div>專案名稱：{{ selectedMember.projectName }}</div>
      <div>
        創業者上傳資訊：
        <template v-for="(doc, i) in selectedMember.docs" :key="i">
          <span class="doc-tag">
            {{ doc }}<span v-if="i < selectedMember.docs.length - 1">、</span>
          </span>
        </template>
      </div>

      <SharedDropdown
        v-model="selectedMember.reviewStatus"
        label="創業計劃書"
        :options="[
          { label: '通過', value: '通過' },
          { label: '不通過', value: '不通過' },
        ]"
        placeholder="審核狀態"
        class="form-group"
      />

      <SharedDropdown
        v-model="selectedMember.idDoc"
        label="身分驗證文件"
        :options="[
          { label: '不通過', value: '不通過' },
          { label: '通過', value: '通過' },
        ]"
        placeholder="身分檢核文件"
        class="form-group"
      />
    </div>

    <div class="modal-section mt-4">
      <div class="title">共創者資訊</div>
      <div>參與專案明細：</div>
      <div class="co-list">
        <div v-for="(c, i) in selectedMember.coCreate" :key="i" class="co-item">
          <div class="co-title">{{ c.title }}</div>
          <div class="co-status">{{ c.status }}</div>
          <div class="co-amount">{{ c.amount }}</div>
        </div>
      </div>
    </div>
  </SharedModal>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {useAuth} from "@/composables/useAuth.js";
import {salesApi} from "@/api/modules/sales.js";
import {stepApi} from "@/api/modules/step.js";
const { isLoggedIn, currentSales } = useAuth();

const showModal = ref(false);
const selectedMember = ref({});

const columns = [
  { key: "type", label: "身分" },
  { key: "planDate", label: "時間" },
  { key: "name", label: "會員名字" },
  { key: "planName", label: "專案名稱" },
  { key: "planStatus", label: "專案狀態"},
  { key: "actions", label: "查看" },
];

const members = reactive([
  {
    id: 1,
    type: "創業者",
    date: "2024-12-03",
    name: "張小白",
    planName: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    planStatus: "管理專案",

    identity: "創業者",
    projectName: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    status: "管理專案",
    projectCount: "創辦1、大創4",
    docs: ["創業計劃書", "合約", "公司資料", "公司帳戶"],
    reviewStatus: "",
    idDoc: "",
    coCreate: [
      {
        title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
        status: "媒合中",
        amount: "200,000",
      },
      {
        title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
        status: "媒合中",
        amount: "200,000",
      },
      {
        title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
        status: "媒合中",
        amount: "200,000",
      },
    ],
  },
]);

const filter = reactive({
  identity: "",
  dateOrder: "",
  region: "",
  status: "",
});

const displayedMembers = computed(() => {
  let list = [...members];
  if (filter.identity)
    list = list.filter((m) => m.identity === filter.identity);
  if (filter.status) list = list.filter((m) => m.status === filter.status);
  if (filter.dateOrder) {
    list.sort((a, b) =>
      filter.dateOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }
  return list;
});


const planSteps = ref([]);
async function getAllPlanStep() {
  const response = await stepApi.getAllPlanStep();
  planSteps.value = response.data;
  console.log(planSteps.value);
}

async function getAllUserBySales() {
  const formData = {
    salesId: currentSales.value
  }

  const response = await salesApi.getAllUserBySales(formData);

  // 直接修改每個成員的 planStatus 為對應的文字
  const processedMembers = response.data.map(member => {
    const step = planSteps.value.find(step => step.id === member.planStatus);
    return {
      ...member,
      planStatus: step ? step.step : `未知狀態 (${member.planStatus})`
    };
  });

  members.splice(0, members.length, ...processedMembers);
}

if (isLoggedIn.value) {
  getAllPlanStep()
  getAllUserBySales();
}

const selectedMemberDetail = ref(null);

async function viewMember(row) {
  selectedMember.value = { ...row };

  const formData = {
    salesId: currentSales.value,
    userId: row.id
  }

  try {
    const response = await salesApi.getUserInfoBySales(formData);
    if (response.code === 0) {
      selectedMemberDetail.value = response.data;
    }
  } catch (error) {
    console.error('獲取用戶詳情失敗:', error);
  }

  showModal.value = true;
}

function handleClose(val) {
  showModal.value = val;
}
</script>
<style scoped lang="scss">
.doc-tag {
  color: $btn-orange;
}

.co-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.co-item {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 10px;
  align-items: center;

  .co-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .co-status {
    text-align: left;
  }
  .co-amount {
    text-align: left;
  }
}

.modal-section {
  gap: 5px;
  display: grid;
  .title {
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    color: $text-dark;
  }
}
</style>
