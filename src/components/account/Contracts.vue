<template>
  <div class="fs-24">公版合約瀏覽及下載</div>
  <section class="justify-content-between">
    <SharedTable :columns="columns" :rows="pagedRows" empty-text="目前沒有合約">
      <!-- 預覽 -->
      <template #preview="{ row }">
        <button class="icon-btn" @click="openModal(row, 'preview')">
          <img src="@/assets/icon/eye.png" alt="預覽" />
        </button>
      </template>

      <!-- 下載 -->
      <template #download="{ row }">
        <button class="icon-btn" @click="openModal(row, 'download')">
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

  <!-- 宣告 Modal -->
  <SharedModal
    v-model="showDisclaimerModal"
    title="注意"
    mode="long"
    @confirm="handleDisclaimerConfirm"
  >
    <div style="text-align: left;">
      「星橋創媒」平台不介入雙方協議與法律仲裁，但有義務維護其他用戶安全。
      若有違約、爭議或異常情況，平台保留資訊揭示、異常通報與媒合暫停之權利。
    </div>
  </SharedModal>

  <!-- PDF 預覽彈出視窗 -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ selectedContract?.name }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="preview-container">
          <template v-if="selectedContract">
            <iframe
                v-if="isPdf(selectedContract.standardContractUrl)"
                :src="selectedContract.standardContractUrl"
                class="content-viewer pdf-viewer"
                title="PDF 預覽"
            ></iframe>
            <img
                v-else
                :src="selectedContract.standardContractUrl"
                class="content-viewer img-viewer"
                alt="預覽圖片"
            />
          </template>
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
import SharedModal from "@/components/shared/Shared-Modal.vue";
import {userApi} from "@/api/modules/user.js";
import {NewAlert} from "@/composables/useAlert.js";

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

const showDisclaimerModal = ref(false);
const currentAction = ref('');

function openModal(row, action) {
  if (founderData.value.status < 1 && coreFounderData.value.status < 1) {
     NewAlert.show("注意！", "請先完成創業者或共創者認證，才能預覽合約內容");
    return;
  }

  selectedContract.value = row;
  currentAction.value = action;
  showDisclaimerModal.value = true;
}

function handleDisclaimerConfirm() {
  showDisclaimerModal.value = false;

  if (currentAction.value === 'preview') {
    showModal.value = true;
    // 防止背景滾動
    document.body.style.overflow = 'hidden';
  } else if (currentAction.value === 'download') {
    downloadFile(selectedContract.value);
  }
}

function closeModal() {
  showModal.value = false;
  selectedContract.value = null;
  // 恢復背景滾動
  document.body.style.overflow = 'auto';
}

function isPdf(url) {
  if (!url) return false;
  // 簡單判斷副檔名，或檢查 content-type (如果這是一個真實的 Object URL)
  // 這裡假設 URL 結尾有 .pdf
  return url.toLowerCase().includes('.pdf');
}

const userData = ref({})
const founderData = ref({})
const coreFounderData = ref({})
const getUserInfo = async () => {
  try {
    const formData = {
      userId: currentUser.value,
    }
    const response = await userApi.getUserInfo(formData);
    userData.value = response.data;
    founderData.value = userData.value.founderInfoData || {};
    coreFounderData.value = userData.value.coreFounderData || {};
  } catch (error) {
    console.error('獲取用戶資料失敗:', error);
  }
}

// 強制下載檔案
async function downloadFile(contract) {
  if (founderData.value.status < 1 && coreFounderData.value.status < 1  ) {
      await NewAlert.show("注意！", "請先完成創業者或共創者認證，才能下載合約內容");
    return;
  }
  try {
    // 方法1: 使用 fetch 下載並創建 blob
    const response = await fetch(contract.standardContractUrl);
    const blob = await response.blob();

    // 創建下載連結
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 判斷副檔名
    const isPdfFile = isPdf(contract.standardContractUrl);
    const ext = isPdfFile ? '.pdf' : '.jpg'; // 預設非 PDF 為 jpg，或是從 URL 擷取更精確的
    
    // 嘗試從 URL 獲取真實副檔名
    let finalExt = ext;
    const match = contract.standardContractUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    if (match) {
        finalExt = '.' + match[1];
    }

    link.download = `${contract.name}${finalExt}`; 
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
  
  // 嘗試從 URL 獲取真實副檔名
  let finalExt = '.pdf';
  const match = contract.standardContractUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  if (match) {
      finalExt = '.' + match[1];
  } else if (!isPdf(contract.standardContractUrl)) {
      finalExt = '.jpg';
  }

  link.download = `${contract.name}${finalExt}`;
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
    getUserInfo(),
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

.preview-container {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.content-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

.img-viewer {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}

.pdf-viewer {
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
