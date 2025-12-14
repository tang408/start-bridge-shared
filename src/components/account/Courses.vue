<template>
  <div class="fs-24">課程/講座報名</div>

  <section class="justify-content-between">
    <SharedTable :columns="columns" :rows="allRows" empty-text="目前課程/講座">
      <template #intro="{ row }">
        <a class="icon-btn" :href="row.lectureUrl" target="_blank" rel="noopener noreferrer">
          <img src="@/assets/icon/search.png" alt="簡介" />
        </a>
      </template>

      <template #apply="{ row }">
        <button class="icon-btn" @click="openModal(row)">
          <img v-if="!row.clicked" src="@/assets/icon/school.png" alt="報名" />
          <img v-else src="@/assets/icon/school-active.png" alt="報名中" />
        </button>
      </template>
    </SharedTable>
  </section>

  <SharedModal
      v-model="showModal"
      :title="selectedCourse.name"
      :mode="'apply'"
      :apply-text="'報名'"
      @apply="onApply"
      @update:modelValue="handleClose"
      class="course-modal"
  >
    <div>課程講師：{{ selectedCourse.teacher }}</div>
    <div>課程日期：{{ selectedCourse.date }}</div>
    <div>課程時間：{{ selectedCourse.time }}</div>
    <div>課程類型：{{ selectedCourse.type }}</div>
    <div>課程地點：{{ selectedCourse.location }}</div>
    <div>課程說明：{{ selectedCourse.description }}</div>
  </SharedModal>
</template>

<script setup>
import {onMounted, ref} from "vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {lectureApi} from "@/api/modules/lecture.js";
import {useAuth} from "@/composables/useAuth.js";
const { isLoggedIn, currentUser } = useAuth()

const showModal = ref(false);
const selectedCourse = ref({});

const columns = [
  {
    key: "updatedAt",
    label: "更新時間",
    width: "120px",
    thClass: "table-wrap-date",
  },
  { key: "name", label: "課程名稱", thClass: "ellipsis" },
  { key: "intro", label: "簡介", width: "80px", tdClass: "ta-center" },
  { key: "apply", label: "報名", width: "80px", tdClass: "ta-center" },
];

const allRows = ref([]);

async function getLectures() {
  const formData = {
    userId: currentUser.value,
  }
  const res = await lectureApi.getLectures(formData);
  if (res.code === 0) {
    allRows.value = res.data.map((lecture) => ({
      ...lecture,
      clicked: false,
    }));
  }
}

function openModal(row) {
  selectedCourse.value = row;
  showModal.value = true;
  const idx = allRows.value.findIndex((r) => r.id === row.id);
  if (idx !== -1) {
    allRows.value[idx].clicked = true;
  }
}

function handleClose(val) {
  showModal.value = val;
  if (!val && selectedCourse.value.id) {
    const idx = allRows.value.findIndex(
        (r) => r.id === selectedCourse.value.id
    );
    if (idx !== -1) {
      allRows.value[idx].clicked = false;
    }
  }
}

function onApply() {
  // 🆕 檢查是否有報名 URL
  if (!selectedCourse.value.url) {
    console.error('課程沒有提供報名連結');
    return;
  }

  // 🆕 直接跳轉到報名 URL（新分頁開啟）
  window.open(selectedCourse.value.url, '_blank');

  // 🆕 關閉 Modal
  showModal.value = false;
}

onMounted(() => {
  Promise.all([
    getLectures(),
  ])
});
</script>

<style lang="scss" scoped>
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;

  @media (max-width: 576px) {
    text-align: start;
    padding: 0;
  }
}

.course-modal .modal-body div {
  font-weight: 400;
  font-size: 14px;
  line-height: 180%;
}
</style>
