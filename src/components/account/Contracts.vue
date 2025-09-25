<template>
  <div class="fs-24">公版合約瀏覽及下載</div>
  <section class="justify-content-between">
    <SharedTable :columns="columns" :rows="pagedRows" empty-text="目前沒有合約">
      <!-- 預覽 -->
      <template #preview="{ row }">
        <button class="icon-btn" @click="openModal(row)">
          <img src="@/assets/icon/eye.png" alt="預覽" />
        </button>
      </template>

      <!-- 下載 -->
      <template #download="{ row }">
        <a class="icon-btn" :href="row.downloadUrl" download>
          <img src="@/assets/icon/dowload.png" alt="下載" />
        </a>
      </template>
    </SharedTable>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <img src="/src/assets/icon/left-arrow.png" />
      </button>

      <button
        v-for="p in totalPages"
        :key="p"
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="changePage(p)"
      >
        {{ p }}
      </button>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <img src="/src/assets/icon/right-arrow.png" />
      </button>
    </div>
  </section>

  <SharedModal v-model="showModal" @confirm="onConfirm">
    「星橋創媒」平台不介入雙方協調與法律仲裁，但有義務維護其他用戶安全。
    若有違約、爭議或異常情況，平台保留資訊揭示、異常通報與媒合暫停之權利。
  </SharedModal>
</template>

<script setup>
import { ref, computed } from "vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";

const showModal = ref(false);
const columns = [
  {
    key: "date",
    label: "更新時間",
    width: "120px",
    thClass: "table-wrap-date",
  },
  { key: "title", label: "合約名稱", thClass: "ellipsis" },
  { key: "preview", label: "預覽", width: "80px", tdClass: "ta-right" },
  { key: "download", label: "下載", width: "80px", tdClass: "ta-right" },
];

const allRows = ref([
  {
    id: 1,
    date: "2024-12-03",
    title: "合約 A",
    downloadUrl: "/contracts/file1.pdf",
  },
  {
    id: 2,
    date: "2024-12-03",
    title: "合約 B",
    downloadUrl: "/contracts/file2.pdf",
  },
  {
    id: 3,
    date: "2024-12-03",
    title: "合約 C",
    downloadUrl: "/contracts/file3.pdf",
  },
  {
    id: 4,
    date: "2024-12-03",
    title: "合約 D",
    downloadUrl: "/contracts/file4.pdf",
  },
  {
    id: 5,
    date: "2024-12-03",
    title: "合約 E",
    downloadUrl: "/contracts/file5.pdf",
  },
  {
    id: 6,
    date: "2024-12-03",
    title: "合約 F",
    downloadUrl: "/contracts/file6.pdf",
  },
  {
    id: 7,
    date: "2024-12-03",
    title: "合約 G",
    downloadUrl: "/contracts/file7.pdf",
  },
  {
    id: 8,
    date: "2024-12-03",
    title: "合約 H",
    downloadUrl: "/contracts/file8.pdf",
  },
  {
    id: 9,
    date: "2024-12-03",
    title: "合約 I",
    downloadUrl: "/contracts/file9.pdf",
  },
  {
    id: 10,
    date: "2024-12-03",
    title: "合約 J",
    downloadUrl: "/contracts/file10.pdf",
  },
]);
const pageSize = 5;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(allRows.value.length / pageSize));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return allRows.value.slice(start, start + pageSize);
});

function changePage(p) {
  currentPage.value = p;
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function openModal() {
  showModal.value = true;
}

function onConfirm() {
  showModal.value = false;
}
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 6px;

  .page-btn {
    border: none;
    background: transparent;
    padding: 4px 8px;
    cursor: pointer;
    color: $text-dark;
    &.active {
      color: #000;
    }
  }
}
</style>
