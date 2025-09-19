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
        <button class="icon-btn" @click="downloadFile(row)">
          <img src="@/assets/icon/dowload.png" alt="下載" />
        </button>
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

  <!-- PDF 預覽彈出視窗 -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ selectedContract?.name }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-disclaimer">
          「星橋創媒」平台不介入雙方協調與法律仲裁，但有義務維護其他用戶安全。
          若有違約、爭議或異常情況，平台保留資訊揭示、異常通報與媒合暫停之權利。
        </div>
        <div class="pdf-container">
          <iframe
              v-if="selectedContract"
              :src="selectedContract.standardContractUrl"
              class="pdf-viewer"
              title="PDF 預覽"
          ></iframe>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">關閉</button>
        <button
            v-if="selectedContract"
            @click="downloadFile(selectedContract)"
            class="btn-primary"
        >
          下載檔案
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from "vue";
import SharedTable from "@/components/shared/Shared-Table.vue";
import {useAuth} from "@/composables/useAuth.js";
import {standardContractApi} from "@/api/modules/standardContract.js";

const {isLoggedIn, currentUser} = useAuth();

const showModal = ref(false);
const selectedContract = ref(null);

const columns = [
  {
    key: "updatedAt",
    label: "更新時間",
    width: "120px",
    thClass: "table-wrap-date",
  },
  {key: "name", label: "合約名稱", thClass: "ellipsis"},
  {key: "preview", label: "預覽", width: "80px", tdClass: "ta-right"},
  {key: "download", label: "下載", width: "80px", tdClass: "ta-right"},
];

const allRows = ref([]);
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

function openModal(row) {
  selectedContract.value = row;
  showModal.value = true;
  // 防止背景滾動
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  showModal.value = false;
  selectedContract.value = null;
  // 恢復背景滾動
  document.body.style.overflow = 'auto';
}

// 強制下載檔案
async function downloadFile(contract) {
  try {
    // 方法1: 使用 fetch 下載並創建 blob
    const response = await fetch(contract.standardContractUrl);
    const blob = await response.blob();

    // 創建下載連結
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract.name}.pdf`; // 使用合約名稱作為檔名
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下載失敗:', error);
    // 如果 fetch 失敗，fallback 到原本的方法
    fallbackDownload(contract);
  }
}

// 備用下載方法
function fallbackDownload(contract) {
  const link = document.createElement('a');
  link.href = contract.standardContractUrl;
  link.download = `${contract.name}.pdf`;
  link.target = '_blank';

  // 設置 Content-Disposition header (如果可能的話)
  link.setAttribute('rel', 'noopener noreferrer');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function getStandardContracts() {
  try {
    const formData = {
      userId: currentUser.value
    }
    const response = await standardContractApi.getStandardContracts(formData);
    allRows.value = response.data;
  } catch (error) {
    console.error('獲取合約資料失敗:', error);
  }
}

// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getStandardContracts()
  ]);
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

// Modal 樣式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #000;
    }
  }
}

.modal-body {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
}

.modal-disclaimer {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  border-left: 4px solid #007bff;
}

.pdf-container {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  background: #f5f5f5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-secondary, .btn-primary {
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: 1px solid #6c757d;

  &:hover {
    background: #5a6268;
  }
}

.btn-primary {
  background: #007bff;
  color: white;
  border: 1px solid #007bff;

  &:hover {
    background: #0056b3;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    height: 95vh;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-body {
    padding: 15px;
  }

  .modal-footer {
    padding: 15px;
    flex-direction: column;

    .btn-secondary, .btn-primary {
      width: 100%;
      margin-bottom: 5px;
    }
  }
}
</style>
